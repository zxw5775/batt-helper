export type AppTheme = 'system' | 'light' | 'dark'
export type AppLocale = 'zh-CN' | 'en-US'

export interface AppSettings {
  theme: AppTheme
  locale: AppLocale
  launchAtLogin: boolean
  startInTray: boolean
  minimizeToTray: boolean
  notificationsEnabled: boolean
  quickPresets: number[]
  hasCompletedOnboarding: boolean
}

export const defaultSettings: AppSettings = {
  theme: 'system',
  locale: 'zh-CN',
  launchAtLogin: false,
  startInTray: false,
  minimizeToTray: true,
  notificationsEnabled: true,
  quickPresets: [60, 70, 80, 90, 100],
  hasCompletedOnboarding: false,
}
