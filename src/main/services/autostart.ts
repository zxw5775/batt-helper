import { app } from 'electron'

export function setLaunchAtLogin(enabled: boolean) {
  app.setLoginItemSettings({ openAtLogin: enabled })
}

export function getLaunchAtLogin() {
  return app.getLoginItemSettings().openAtLogin
}
