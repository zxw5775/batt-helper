import { app } from 'electron'
import { join } from 'node:path'
import { createMainWindow, markAppQuitting } from './window'
import { createTray, destroyTray } from './tray'
import { refreshNativeMenus, configureAboutPanel } from './menu'
import { registerBattIpc } from './ipc/batt'
import { registerSettingsIpc } from './ipc/settings'
import { registerAppIpc } from './ipc/app'
import { log } from './services/logger'

function applyAppIcon() {
  if (process.platform !== 'darwin') {
    return
  }

  try {
    app.dock?.setIcon(join(app.getAppPath(), 'build/icon.png'))
  } catch (error) {
    log('app', 'set-dock-icon-failed', { message: error instanceof Error ? error.message : String(error) })
  }
}

function bootstrap() {
  registerBattIpc()
  registerSettingsIpc()
  registerAppIpc()
  createMainWindow()
  createTray()
  configureAboutPanel()
  refreshNativeMenus()
}

app.whenReady().then(() => {
  applyAppIcon()
  bootstrap()
  log('app', 'ready')

  app.on('activate', () => {
    createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  markAppQuitting()
  destroyTray()
})
