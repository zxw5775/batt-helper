import { execFile } from 'node:child_process'
import { accessSync, constants } from 'node:fs'
import { delimiter, join } from 'node:path'
import { promisify } from 'node:util'
import type { BattErrorCode } from '@shared/batt'
import { log } from '../logger'

const execFileAsync = promisify(execFile)
const commonPath = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
const allowedCommands = new Set([
  'status',
  'limit',
  'disable',
  'lower-limit-delta',
  'adapter',
  'calibration',
  'schedule',
  'prevent-idle-sleep',
  'disable-charging-pre-sleep',
  'prevent-system-sleep',
  'version',
  'install',
  'uninstall',
])

export interface BattCommandError extends Error {
  codeLabel: BattErrorCode
  stderr?: string
  stdout?: string
}

function collectSearchPaths() {
  const customBinary = process.env.BATT_BINARY
  if (customBinary) {
    return [customBinary]
  }

  const envPaths = (process.env.PATH ?? '').split(delimiter).filter(Boolean)
  const defaultPaths = commonPath.split(':').filter(Boolean)
  return Array.from(new Set([...defaultPaths, ...envPaths]))
}

function findBinaryInPath(binaryName: string) {
  const customBinary = process.env.BATT_BINARY
  if (customBinary && binaryName === 'batt') {
    return customBinary
  }

  for (const segment of collectSearchPaths()) {
    const fullPath = join(segment, binaryName)
    try {
      accessSync(fullPath, constants.X_OK)
      return fullPath
    } catch {
      continue
    }
  }

  return null
}

export function getBattBinaryPath() {
  return findBinaryInPath('batt')
}

export function getBinaryPath(binaryName: string) {
  return findBinaryInPath(binaryName)
}

export function classifyBattError(message: string, stderr = ''): BattErrorCode {
  const source = `${message}\n${stderr}`.toLowerCase()

  if (source.includes('not found') || source.includes('enoent')) {
    return 'BATT_NOT_FOUND'
  }
  if (source.includes('apple silicon') || source.includes('unsupported')) {
    return 'UNSUPPORTED_DEVICE'
  }
  if (source.includes('permission denied') || source.includes('operation not permitted') || source.includes('not authorized')) {
    return 'PERMISSION_DENIED'
  }
  if (source.includes('version mismatch')) {
    return 'VERSION_MISMATCH'
  }
  if (source.includes('failed to connect') || source.includes('daemon') || source.includes('socket')) {
    return 'DAEMON_NOT_RUNNING'
  }

  return 'COMMAND_FAILED'
}

export async function runBattCommand(args: string[]) {
  const [command] = args
  if (!command || !allowedCommands.has(command)) {
    throw new Error(`Unsupported batt command: ${command}`)
  }

  const binaryPath = getBattBinaryPath()
  if (!binaryPath) {
    const error = new Error('batt binary not found') as BattCommandError
    error.codeLabel = 'BATT_NOT_FOUND'
    throw error
  }

  try {
    log('batt', 'exec', { binaryPath, args })
    const result = await execFileAsync(binaryPath, args, { timeout: 20_000, maxBuffer: 1024 * 1024 })
    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    }
  } catch (rawError) {
    const error = rawError as NodeJS.ErrnoException & { stdout?: string; stderr?: string; message: string }
    const wrapped = new Error(error.message) as BattCommandError
    wrapped.stderr = error.stderr?.trim()
    wrapped.stdout = error.stdout?.trim()
    wrapped.codeLabel = classifyBattError(error.message, error.stderr)
    log('batt', 'exec-failed', { args, message: error.message, stderr: wrapped.stderr, stdout: wrapped.stdout })
    throw wrapped
  }
}

export async function runShellCommand(command: string) {
  try {
    log('shell', 'exec', { command })
    const result = await execFileAsync('/bin/bash', ['-lc', `export PATH="${commonPath}:$PATH"; ${command}`], {
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
    })
    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    }
  } catch (rawError) {
    const error = rawError as NodeJS.ErrnoException & { stdout?: string; stderr?: string; message: string }
    const wrapped = new Error(error.message) as BattCommandError
    wrapped.stderr = error.stderr?.trim()
    wrapped.stdout = error.stdout?.trim()
    wrapped.codeLabel = classifyBattError(error.message, error.stderr)
    log('shell', 'exec-failed', { command, message: error.message, stderr: wrapped.stderr, stdout: wrapped.stdout })
    throw wrapped
  }
}

function quoteAppleScriptText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export async function runPrivilegedShellCommand(command: string) {
  const shellCommand = `export PATH="${commonPath}:$PATH"; ${command}`
  const script = `do shell script \"${quoteAppleScriptText(shellCommand)}\" with administrator privileges`

  try {
    const result = await execFileAsync('/usr/bin/osascript', ['-e', script], { timeout: 300_000, maxBuffer: 1024 * 1024 })
    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    }
  } catch (rawError) {
    const error = rawError as NodeJS.ErrnoException & { stdout?: string; stderr?: string; message: string }
    const wrapped = new Error(error.message) as BattCommandError
    wrapped.stderr = error.stderr?.trim()
    wrapped.stdout = error.stdout?.trim()
    wrapped.codeLabel = classifyBattError(error.message, error.stderr)
    throw wrapped
  }
}

export async function runPrivilegedBattCommand(args: string[]) {
  const binaryPath = getBattBinaryPath()
  if (!binaryPath) {
    const error = new Error('batt binary not found') as BattCommandError
    error.codeLabel = 'BATT_NOT_FOUND'
    throw error
  }

  const shellCommand = `${binaryPath} ${args.join(' ')}`
  const script = `do shell script \"${quoteAppleScriptText(shellCommand)}\" with administrator privileges`

  try {
    const result = await execFileAsync('/usr/bin/osascript', ['-e', script], { timeout: 120_000 })
    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    }
  } catch (rawError) {
    const error = rawError as NodeJS.ErrnoException & { stdout?: string; stderr?: string; message: string }
    const wrapped = new Error(error.message) as BattCommandError
    wrapped.stderr = error.stderr?.trim()
    wrapped.stdout = error.stdout?.trim()
    wrapped.codeLabel = classifyBattError(error.message, error.stderr)
    throw wrapped
  }
}
