import { ipcMain } from 'electron'
import { z } from 'zod'
import { battBridgeService } from '../services/batt-bridge'

const limitSchema = z.number().int().min(10).max(100)
const deltaSchema = z.number().int().min(1).max(20)
const toggleSchema = z.boolean()
const thresholdSchema = z.number().int().min(10).max(50)
const holdDurationSchema = z.number().int().min(10).max(1440)
const cronSchema = z.string().min(5).max(120)

export function registerBattIpc() {
  ipcMain.handle('batt:getStatus', () => battBridgeService.getStatus())
  ipcMain.handle('batt:getDiagnostics', () => battBridgeService.getDiagnostics())
  ipcMain.handle('batt:updateCore', () => battBridgeService.updateCore())
  ipcMain.handle('batt:setLimit', (_event, limit: number) => battBridgeService.setLimit(limitSchema.parse(limit)))
  ipcMain.handle('batt:disableLimit', () => battBridgeService.disableLimit())
  ipcMain.handle('batt:setLowerLimitDelta', (_event, delta: number) => battBridgeService.setLowerLimitDelta(deltaSchema.parse(delta)))
  ipcMain.handle('batt:setAdapter', (_event, enabled: boolean) => battBridgeService.setAdapter(toggleSchema.parse(enabled)))
  ipcMain.handle('batt:setPreventIdleSleep', (_event, enabled: boolean) => battBridgeService.setPreventIdleSleep(toggleSchema.parse(enabled)))
  ipcMain.handle('batt:setDisableChargingPreSleep', (_event, enabled: boolean) => battBridgeService.setDisableChargingPreSleep(toggleSchema.parse(enabled)))
  ipcMain.handle('batt:setPreventSystemSleep', (_event, enabled: boolean) => battBridgeService.setPreventSystemSleep(toggleSchema.parse(enabled)))
  ipcMain.handle('batt:calibrationStart', () => battBridgeService.calibrationStart())
  ipcMain.handle('batt:calibrationPause', () => battBridgeService.calibrationPause())
  ipcMain.handle('batt:calibrationResume', () => battBridgeService.calibrationResume())
  ipcMain.handle('batt:calibrationCancel', () => battBridgeService.calibrationCancel())
  ipcMain.handle('batt:setCalibrationThreshold', (_event, value: number) => battBridgeService.setCalibrationThreshold(thresholdSchema.parse(value)))
  ipcMain.handle('batt:setCalibrationHoldDuration', (_event, value: number) => battBridgeService.setCalibrationHoldDuration(holdDurationSchema.parse(value)))
  ipcMain.handle('batt:scheduleSet', (_event, cron: string) => battBridgeService.scheduleSet(cronSchema.parse(cron)))
  ipcMain.handle('batt:scheduleShow', () => battBridgeService.scheduleShow())
  ipcMain.handle('batt:scheduleDisable', () => battBridgeService.scheduleDisable())
  ipcMain.handle('batt:installDaemon', () => battBridgeService.installDaemon())
  ipcMain.handle('batt:uninstallDaemon', () => battBridgeService.uninstallDaemon())
}
