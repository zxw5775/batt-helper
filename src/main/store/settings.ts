import Store from 'electron-store'
import type { AppSettings } from '@shared/settings'
import { defaultSettings } from '@shared/settings'

const store = new Store<AppSettings>({
  name: 'settings',
  defaults: defaultSettings,
})

export function getSettings(): AppSettings {
  return {
    theme: store.get('theme', defaultSettings.theme),
    locale: store.get('locale', defaultSettings.locale),
    launchAtLogin: store.get('launchAtLogin', defaultSettings.launchAtLogin),
    startInTray: store.get('startInTray', defaultSettings.startInTray),
    minimizeToTray: store.get('minimizeToTray', defaultSettings.minimizeToTray),
    notificationsEnabled: store.get('notificationsEnabled', defaultSettings.notificationsEnabled),
    quickPresets: store.get('quickPresets', defaultSettings.quickPresets),
    hasCompletedOnboarding: store.get('hasCompletedOnboarding', defaultSettings.hasCompletedOnboarding),
  }
}

export function setSettings(payload: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next = { ...current, ...payload }

  store.set('theme', next.theme)
  store.set('locale', next.locale)
  store.set('launchAtLogin', next.launchAtLogin)
  store.set('startInTray', next.startInTray)
  store.set('minimizeToTray', next.minimizeToTray)
  store.set('notificationsEnabled', next.notificationsEnabled)
  store.set('quickPresets', next.quickPresets)
  store.set('hasCompletedOnboarding', next.hasCompletedOnboarding)

  return next
}
