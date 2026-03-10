import { ipcMain } from 'electron'
import { z } from 'zod'
import { setLaunchAtLogin } from '../services/autostart'
import { refreshNativeMenus } from '../menu'
import { getSettings, setSettings } from '../store/settings'

const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  locale: z.enum(['zh-CN', 'en-US']).optional(),
  launchAtLogin: z.boolean().optional(),
  startInTray: z.boolean().optional(),
  minimizeToTray: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  quickPresets: z.array(z.number().int().min(10).max(100)).optional(),
  hasCompletedOnboarding: z.boolean().optional(),
})

export function registerSettingsIpc() {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:set', (_event, payload: unknown) => {
    const parsed = settingsSchema.parse(payload)
    if (typeof parsed.launchAtLogin === 'boolean') {
      setLaunchAtLogin(parsed.launchAtLogin)
    }
    const next = setSettings(parsed)
    refreshNativeMenus()
    return next
  })
}
