import type { AppTheme } from '@shared/settings'

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.dataset.theme = isDark ? 'dark' : 'light'
    return
  }

  root.dataset.theme = theme
}
