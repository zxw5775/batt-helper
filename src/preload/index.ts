import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopAPI } from '@shared/ipc'

const api: DesktopAPI = {
  batt: {
    getStatus: () => ipcRenderer.invoke('batt:getStatus'),
    getDiagnostics: () => ipcRenderer.invoke('batt:getDiagnostics'),
    updateCore: () => ipcRenderer.invoke('batt:updateCore'),
    setLimit: (limit) => ipcRenderer.invoke('batt:setLimit', limit),
    disableLimit: () => ipcRenderer.invoke('batt:disableLimit'),
    setLowerLimitDelta: (delta) => ipcRenderer.invoke('batt:setLowerLimitDelta', delta),
    setAdapter: (enabled) => ipcRenderer.invoke('batt:setAdapter', enabled),
    setPreventIdleSleep: (enabled) => ipcRenderer.invoke('batt:setPreventIdleSleep', enabled),
    setDisableChargingPreSleep: (enabled) => ipcRenderer.invoke('batt:setDisableChargingPreSleep', enabled),
    setPreventSystemSleep: (enabled) => ipcRenderer.invoke('batt:setPreventSystemSleep', enabled),
    calibrationStart: () => ipcRenderer.invoke('batt:calibrationStart'),
    calibrationPause: () => ipcRenderer.invoke('batt:calibrationPause'),
    calibrationResume: () => ipcRenderer.invoke('batt:calibrationResume'),
    calibrationCancel: () => ipcRenderer.invoke('batt:calibrationCancel'),
    setCalibrationThreshold: (value) => ipcRenderer.invoke('batt:setCalibrationThreshold', value),
    setCalibrationHoldDuration: (value) => ipcRenderer.invoke('batt:setCalibrationHoldDuration', value),
    scheduleSet: (cron) => ipcRenderer.invoke('batt:scheduleSet', cron),
    scheduleShow: () => ipcRenderer.invoke('batt:scheduleShow'),
    scheduleDisable: () => ipcRenderer.invoke('batt:scheduleDisable'),
    installDaemon: () => ipcRenderer.invoke('batt:installDaemon'),
    uninstallDaemon: () => ipcRenderer.invoke('batt:uninstallDaemon'),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (payload) => ipcRenderer.invoke('settings:set', payload),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    openWindow: () => ipcRenderer.invoke('app:openWindow'),
  },
}

contextBridge.exposeInMainWorld('appAPI', api)
