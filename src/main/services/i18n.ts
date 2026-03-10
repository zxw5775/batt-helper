import zhCN from '../../renderer/locales/zh-CN.json'
import enUS from '../../renderer/locales/en-US.json'
import { getSettings } from '../store/settings'
import type { AppLocale } from '@shared/settings'

const resources = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const

type LocaleKey = keyof typeof resources

function resolve(locale: AppLocale | string) {
  return resources[(locale in resources ? locale : 'zh-CN') as LocaleKey]
}

function getValue(source: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[segment]
    }
    return undefined
  }, source)
}

function normalizeState(state?: string) {
  const value = (state ?? 'idle').trim().toLowerCase()
  if (value === 'charging' || value === 'discharging' || value === 'full' || value === 'idle') {
    return value
  }
  if (value === 'notcharging' || value === 'not_charging' || value === 'not-charging') {
    return 'notCharging'
  }
  return state
}

export function tMain(key: string, variables: Record<string, string | number> = {}, locale: AppLocale = getSettings().locale) {
  const template = getValue(resolve(locale), key)
  if (typeof template !== 'string') {
    return key
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_match, variable) => String(variables[variable.trim()] ?? ''))
}

export function tBatteryStateMain(state?: string, locale?: AppLocale) {
  const normalized = normalizeState(state)
  const known = ['charging', 'discharging', 'full', 'notCharging', 'idle']
  if (typeof normalized === 'string' && known.includes(normalized)) {
    return tMain(`state.${normalized}`, {}, locale)
  }
  return state ?? tMain('state.idle', {}, locale)
}

export function tInstallMethodMain(method?: string, locale?: AppLocale) {
  const known = ['homebrew', 'script', 'manual', 'unknown']
  const normalized = known.includes(method ?? '') ? method! : 'unknown'
  return tMain(`installMethod.${normalized}`, {}, locale)
}
