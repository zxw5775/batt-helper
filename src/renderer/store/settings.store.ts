import { create } from 'zustand'
import type { AppSettings } from '@shared/settings'
import { defaultSettings } from '@shared/settings'
import i18n from '../services/i18n'
import { applyTheme } from '../services/theme'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  load: () => Promise<void>
  update: (payload: Partial<AppSettings>) => Promise<AppSettings>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  loaded: false,
  load: async () => {
    const settings = await window.appAPI.settings.get()
    applyTheme(settings.theme)
    await i18n.changeLanguage(settings.locale)
    set({ settings, loaded: true })
  },
  update: async (payload) => {
    const next = await window.appAPI.settings.set(payload)
    applyTheme(next.theme)
    await i18n.changeLanguage(next.locale)
    set({ settings: next, loaded: true })
    return next
  },
}))
