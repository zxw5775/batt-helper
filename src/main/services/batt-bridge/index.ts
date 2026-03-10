import http from 'node:http'
import https from 'node:https'
import type { BattDiagnostics, BattInstallMethod, BattStatus, BattUpdateInfo, CommandResult, ScheduleInfo } from '@shared/batt'
import { battStatusSchema, telemetrySchema } from './types'
import { mergeBattStatus } from './mapper'
import { getBattBinaryPath, getBinaryPath, runBattCommand, runPrivilegedBattCommand, runPrivilegedShellCommand, runShellCommand, type BattCommandError } from './cli'
import { tMain } from '../i18n'

const defaultSocketPath = process.env.BATT_DAEMON_SOCKET || '/var/run/batt.sock'

function toResult(message: string): CommandResult {
  return { ok: true, message: message || 'ok' }
}

function toFriendlyError(error: unknown): Error & { codeLabel?: string } {
  const battError = error as BattCommandError
  const wrapped = new Error(battError.stderr || battError.message)
  wrapped.name = battError.codeLabel ?? 'COMMAND_FAILED'
  ;(wrapped as Error & { codeLabel?: string }).codeLabel = battError.codeLabel
  return wrapped as Error & { codeLabel?: string }
}

async function runJsonCommand<T>(args: string[], schema: { parse(input: unknown): T }) {
  const { stdout } = await runBattCommand(args)
  return schema.parse(JSON.parse(stdout || '{}'))
}

async function requestDaemonJson<T>(path: string, schema: { parse(input: unknown): T }) {
  return new Promise<T>((resolve, reject) => {
    const req = http.request(
      {
        socketPath: defaultSocketPath,
        path,
        method: 'GET',
      },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(body || `Request failed with status ${res.statusCode}`))
            return
          }
          try {
            resolve(schema.parse(JSON.parse(body || '{}')))
          } catch (error) {
            reject(error)
          }
        })
      },
    )

    req.on('error', reject)
    req.end()
  })
}

async function getTelemetryFromDaemon() {
  try {
    return await requestDaemonJson('/telemetry', telemetrySchema)
  } catch {
    return undefined
  }
}

function parseVersionOutput(stdout: string) {
  const lines = stdout.split('\n').map((line) => line.trim())
  const client = lines.find((line) => line.toLowerCase().startsWith('client:'))?.split(':').slice(1).join(':').trim()
  const daemon = lines.find((line) => line.toLowerCase().startsWith('daemon:'))?.split(':').slice(1).join(':').trim()
  return { client, daemon }
}

function parseScheduleOutput(stdout: string): ScheduleInfo {
  const lines = stdout.split('\n').map((line) => line.trim()).filter(Boolean)
  const disabled = lines.some((line) => line.toLowerCase().includes('disabled') || line.toLowerCase().includes('not set'))
  const cronLine = lines.find((line) => line.includes('(') && line.includes(')'))
  return {
    enabled: !disabled,
    cron: cronLine?.match(/\((.*)\)/)?.[1] ?? '',
    nextRuns: lines.filter((line) => /^\d+\./.test(line) || /\d{4}-\d{2}-\d{2}/.test(line)),
  }
}

function normalizeVersion(version?: string) {
  return version?.trim().replace(/^v/i, '')
}

function compareVersions(left?: string, right?: string) {
  const leftParts = normalizeVersion(left)?.split('.').map((item) => Number(item)) ?? []
  const rightParts = normalizeVersion(right)?.split('.').map((item) => Number(item)) ?? []
  const maxLength = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0
    const rightValue = rightParts[index] ?? 0
    if (leftValue > rightValue) {
      return 1
    }
    if (leftValue < rightValue) {
      return -1
    }
  }

  return 0
}

function detectInstallMethod(binaryPath?: string | null): BattInstallMethod {
  if (!binaryPath) {
    return 'unknown'
  }
  if (binaryPath.startsWith('/opt/homebrew/')) {
    return 'homebrew'
  }
  if (binaryPath.startsWith('/usr/local/bin/')) {
    return 'script'
  }
  return 'manual'
}

function requestLatestRelease() {
  return new Promise<{ latestVersion?: string; releaseUrl?: string; publishedAt?: string }>((resolve) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: '/repos/charlie0129/batt/releases/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'Batt Helper',
          Accept: 'application/vnd.github+json',
        },
      },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}') as { tag_name?: string; html_url?: string; published_at?: string }
            resolve({
              latestVersion: parsed.tag_name,
              releaseUrl: parsed.html_url,
              publishedAt: parsed.published_at,
            })
          } catch {
            resolve({})
          }
        })
      },
    )

    req.on('error', () => resolve({}))
    req.end()
  })
}

async function buildUpdateInfo(binaryPath: string | null, installedVersion?: string): Promise<BattUpdateInfo> {
  const installMethod = detectInstallMethod(binaryPath)
  const latestRelease = await requestLatestRelease()
  const latestVersion = latestRelease.latestVersion
  const updateAvailable = !installedVersion || (latestVersion ? compareVersions(installedVersion, latestVersion) < 0 : false)

  return {
    installMethod,
    installedVersion,
    latestVersion,
    updateAvailable,
    canAutoUpdate: installMethod !== 'manual' || !binaryPath,
    releaseUrl: latestRelease.releaseUrl,
    publishedAt: latestRelease.publishedAt,
    checkedAt: new Date().toISOString(),
  }
}

class BattBridgeService {
  async getDiagnostics(): Promise<BattDiagnostics> {
    const platformSupported = process.platform === 'darwin' && process.arch === 'arm64'
    const binaryPath = getBattBinaryPath()
    const update = await buildUpdateInfo(binaryPath, undefined)

    if (!binaryPath) {
      return {
        available: false,
        daemonInstalled: false,
        daemonRunning: false,
        platformSupported,
        update,
        errorCode: 'BATT_NOT_FOUND',
        errorMessage: tMain('batt.missingBinary'),
      }
    }

    let versionStdout = ''
    try {
      const version = await runBattCommand(['version'])
      versionStdout = version.stdout
    } catch {
      versionStdout = ''
    }

    const versions = parseVersionOutput(versionStdout)
    const versionedUpdate = await buildUpdateInfo(binaryPath, versions.client)

    try {
      await this.getStatus()
      return {
        available: true,
        daemonInstalled: true,
        daemonRunning: true,
        platformSupported,
        binaryPath,
        battVersion: versions.client,
        daemonVersion: versions.daemon,
        update: versionedUpdate,
      }
    } catch (error) {
      const friendly = toFriendlyError(error)
      return {
        available: true,
        daemonInstalled: friendly.codeLabel !== 'BATT_NOT_FOUND',
        daemonRunning: false,
        platformSupported,
        binaryPath,
        battVersion: versions.client,
        daemonVersion: versions.daemon,
        update: versionedUpdate,
        errorCode: (friendly.codeLabel as BattDiagnostics['errorCode']) ?? 'COMMAND_FAILED',
        errorMessage: friendly.message,
      }
    }
  }

  async getStatus(): Promise<BattStatus> {
    try {
      const status = await runJsonCommand(['status', '--json'], battStatusSchema)
      const telemetry = await getTelemetryFromDaemon()
      return mergeBattStatus(status, telemetry)
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setLimit(limit: number) {
    try {
      const { stdout, stderr } = await runBattCommand(['limit', String(limit)])
      return toResult(stdout || stderr || tMain("batt.limitSet", { limit }))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async disableLimit() {
    try {
      const { stdout, stderr } = await runBattCommand(['disable'])
      return toResult(stdout || stderr || tMain('batt.limitDisabled'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setLowerLimitDelta(delta: number) {
    try {
      const { stdout, stderr } = await runBattCommand(['lower-limit-delta', String(delta)])
      return toResult(stdout || stderr || tMain("batt.deltaSet", { delta }))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setAdapter(enabled: boolean) {
    try {
      const { stdout, stderr } = await runBattCommand(['adapter', enabled ? 'enable' : 'disable'])
      return toResult(stdout || stderr || (enabled ? tMain('batt.adapterEnabled') : tMain('batt.adapterDisabled')))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setPreventIdleSleep(enabled: boolean) {
    try {
      const { stdout, stderr } = await runBattCommand(['prevent-idle-sleep', enabled ? 'enable' : 'disable'])
      return toResult(stdout || stderr || tMain('batt.settingsUpdated'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setDisableChargingPreSleep(enabled: boolean) {
    try {
      const { stdout, stderr } = await runBattCommand(['disable-charging-pre-sleep', enabled ? 'enable' : 'disable'])
      return toResult(stdout || stderr || tMain('batt.settingsUpdated'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setPreventSystemSleep(enabled: boolean) {
    try {
      const { stdout, stderr } = await runBattCommand(['prevent-system-sleep', enabled ? 'enable' : 'disable'])
      return toResult(stdout || stderr || tMain('batt.settingsUpdated'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async calibrationStart() {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'start'])
      return toResult(stdout || stderr || tMain('batt.calibrationStarted'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async calibrationPause() {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'pause'])
      return toResult(stdout || stderr || tMain('batt.calibrationPaused'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async calibrationResume() {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'resume'])
      return toResult(stdout || stderr || tMain('batt.calibrationResumed'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async calibrationCancel() {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'cancel'])
      return toResult(stdout || stderr || tMain('batt.calibrationCanceled'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setCalibrationThreshold(value: number) {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'discharge-threshold', String(value)])
      return toResult(stdout || stderr || tMain('batt.thresholdUpdated'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async setCalibrationHoldDuration(value: number) {
    try {
      const { stdout, stderr } = await runBattCommand(['calibration', 'hold-duration', String(value)])
      return toResult(stdout || stderr || tMain('batt.holdDurationUpdated'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async scheduleSet(cron: string) {
    try {
      const { stdout } = await runBattCommand(['schedule', cron])
      const parsed = parseScheduleOutput(stdout)
      return { ...parsed, enabled: true, cron: parsed.cron || cron }
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async scheduleShow() {
    try {
      const { stdout } = await runBattCommand(['schedule', 'show'])
      return parseScheduleOutput(stdout)
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async scheduleDisable() {
    try {
      const { stdout, stderr } = await runBattCommand(['schedule', 'disable'])
      return toResult(stdout || stderr || tMain('batt.scheduleDisabled'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async installDaemon() {
    try {
      const { stdout, stderr } = await runPrivilegedBattCommand(['install', '--allow-non-root-access'])
      return toResult(stdout || stderr || tMain('batt.daemonInstalled'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async updateCore() {
    const binaryPath = getBattBinaryPath()
    const installMethod = detectInstallMethod(binaryPath)

    try {
      if (!binaryPath || installMethod === 'script') {
        const { stdout, stderr } = await runPrivilegedShellCommand('curl -fsSL https://raw.githubusercontent.com/charlie0129/batt/master/hack/install.sh | /bin/bash -s -- -y')
        return toResult(stdout || stderr || tMain('batt.coreInstalledOrUpdated'))
      }

      if (installMethod === 'homebrew') {
        const brewPath = getBinaryPath('brew')
        if (!brewPath) {
          throw new Error(tMain('batt.homebrewMissing'))
        }

        await runShellCommand(`${brewPath} update && ${brewPath} upgrade batt`)
        const { stdout, stderr } = await runPrivilegedBattCommand(['install', '--allow-non-root-access'])
        return toResult(stdout || stderr || tMain('batt.coreUpdatedHomebrew'))
      }

      throw new Error(tMain('batt.manualUpdateOnly'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }

  async uninstallDaemon() {
    try {
      const { stdout, stderr } = await runPrivilegedBattCommand(['uninstall'])
      return toResult(stdout || stderr || tMain('batt.daemonUninstalled'))
    } catch (error) {
      throw toFriendlyError(error)
    }
  }
}

export const battBridgeService = new BattBridgeService()
