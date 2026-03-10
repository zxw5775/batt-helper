import type { BattDiagnostics, BattStatus, CommandResult, ScheduleInfo } from './batt'
import type { AppSettings } from './settings'

export interface BattAPI {
  getStatus(): Promise<BattStatus>
  getDiagnostics(): Promise<BattDiagnostics>
  updateCore(): Promise<CommandResult>
  setLimit(limit: number): Promise<CommandResult>
  disableLimit(): Promise<CommandResult>
  setLowerLimitDelta(delta: number): Promise<CommandResult>
  setAdapter(enabled: boolean): Promise<CommandResult>
  setPreventIdleSleep(enabled: boolean): Promise<CommandResult>
  setDisableChargingPreSleep(enabled: boolean): Promise<CommandResult>
  setPreventSystemSleep(enabled: boolean): Promise<CommandResult>
  calibrationStart(): Promise<CommandResult>
  calibrationPause(): Promise<CommandResult>
  calibrationResume(): Promise<CommandResult>
  calibrationCancel(): Promise<CommandResult>
  setCalibrationThreshold(value: number): Promise<CommandResult>
  setCalibrationHoldDuration(value: number): Promise<CommandResult>
  scheduleSet(cron: string): Promise<ScheduleInfo>
  scheduleShow(): Promise<ScheduleInfo>
  scheduleDisable(): Promise<CommandResult>
  installDaemon(): Promise<CommandResult>
  uninstallDaemon(): Promise<CommandResult>
}

export interface SettingsAPI {
  get(): Promise<AppSettings>
  set(payload: Partial<AppSettings>): Promise<AppSettings>
}

export interface AppAPI {
  getVersion(): Promise<string>
  openWindow(): Promise<void>
}

export interface DesktopAPI {
  batt: BattAPI
  settings: SettingsAPI
  app: AppAPI
}
