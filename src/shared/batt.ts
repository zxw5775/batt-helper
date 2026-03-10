export type BatteryState = 'charging' | 'discharging' | 'full' | 'notCharging'

export interface BattStatus {
  charging: {
    allowCharging: boolean
    useAdapter: boolean
    pluggedIn: boolean
  }
  battery: {
    currentChargePercent: number
    state: BatteryState
    timeToLimitMinutes?: number
    fullCapacityMah: number
    chargeRateWatts: number
    voltageVolts: number
  }
  configuration: {
    enabled: boolean
    upperLimitPercent: number
    lowerLimitPercent: number
    preventIdleSleep: boolean
    disableChargingPreSleep: boolean
    preventSystemSleep: boolean
    allowNonRootAccess: boolean
    controlMagSafeLed?: {
      enabled: boolean
      mode: string
    }
  }
  telemetry?: {
    healthPercent?: number
    cycleCount?: number
    acPowerWatts?: number
    batteryPowerWatts?: number
    systemPowerWatts?: number
  }
  calibration?: {
    phase: string
    startedAt?: string
    paused: boolean
    canPause: boolean
    canCancel: boolean
    message: string
    chargePercent?: number
    pluggedIn?: boolean
    remainingHoldSeconds?: number
    targetPercent?: number
    schedule: {
      enabled: boolean
      cron: string
      scheduledAt?: string
    }
  }
}

export interface BattDiagnostics {
  available: boolean
  daemonInstalled: boolean
  daemonRunning: boolean
  platformSupported: boolean
  binaryPath?: string
  battVersion?: string
  daemonVersion?: string
  update?: BattUpdateInfo
  errorCode?: BattErrorCode
  errorMessage?: string
}

export type BattInstallMethod = 'homebrew' | 'script' | 'manual' | 'unknown'

export interface BattUpdateInfo {
  installMethod: BattInstallMethod
  installedVersion?: string
  latestVersion?: string
  updateAvailable: boolean
  canAutoUpdate: boolean
  releaseUrl?: string
  publishedAt?: string
  checkedAt?: string
}

export type BattErrorCode =
  | 'BATT_NOT_FOUND'
  | 'DAEMON_NOT_INSTALLED'
  | 'DAEMON_NOT_RUNNING'
  | 'PERMISSION_DENIED'
  | 'VERSION_MISMATCH'
  | 'UNSUPPORTED_DEVICE'
  | 'COMMAND_FAILED'

export interface CommandResult {
  ok: boolean
  message: string
}

export interface ScheduleInfo {
  enabled: boolean
  cron: string
  nextRuns: string[]
}
