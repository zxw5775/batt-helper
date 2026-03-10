import type { TFunction } from 'i18next'
import type { BattInstallMethod } from '@shared/batt'

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

export function translateBatteryState(t: TFunction, state?: string) {
  const normalized = normalizeState(state)
  if (normalized === 'charging' || normalized === 'discharging' || normalized === 'full' || normalized === 'notCharging' || normalized === 'idle') {
    return t(`state.${normalized}`)
  }
  return state ?? t('state.idle')
}

export function translateInstallMethod(t: TFunction, method?: BattInstallMethod | string) {
  const normalized = (method ?? 'unknown') as BattInstallMethod | 'unknown'
  if (normalized === 'homebrew' || normalized === 'script' || normalized === 'manual' || normalized === 'unknown') {
    return t(`installMethod.${normalized}`)
  }
  return method ?? t('installMethod.unknown')
}

export function translateBoolean(t: TFunction, value?: boolean) {
  return value ? t('common.yes') : t('common.no')
}
