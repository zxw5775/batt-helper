import { app } from 'electron'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

let logFilePath: string | null = null

function ensureLogFile() {
  if (logFilePath) {
    return logFilePath
  }

  const baseDir = app.isReady() ? app.getPath('logs') : join(process.env.HOME ?? '', 'Library/Logs/Batt Helper')
  logFilePath = join(baseDir, 'main.log')
  mkdirSync(dirname(logFilePath), { recursive: true })
  return logFilePath
}

export function log(scope: string, message: string, payload?: unknown) {
  const line = `[${new Date().toISOString()}] [${scope}] ${message}${payload ? ` ${JSON.stringify(payload)}` : ''}\n`
  try {
    appendFileSync(ensureLogFile(), line)
  } catch {
    console.log(line)
  }
}
