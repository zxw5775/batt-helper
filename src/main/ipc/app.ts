import { app, ipcMain } from 'electron'
import { showMainWindow } from '../window'

export function registerAppIpc() {
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:openWindow', () => {
    showMainWindow()
  })
}
