import { NavLink, Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import appLogo from '../../../../resources/brand/app-logo-primary.png'
import { useAppStore } from '@renderer/store/app.store'
import { useBattStore } from '@renderer/store/batt.store'
import { Button } from '../ui/Button'
import { translateBatteryState } from '@renderer/services/translation'

export function AppShell() {
  const { t } = useTranslation()
  const version = useAppStore((state) => state.version)
  const status = useBattStore((state) => state.status)
  const refresh = useBattStore((state) => state.refresh)

  const navItems = [
    { path: '/', label: t('nav.dashboard') },
    { path: '/charging', label: t('nav.charging') },
    { path: '/health', label: t('nav.health') },
    { path: '/calibration', label: t('nav.calibration') },
    { path: '/settings', label: t('nav.settings') },
    { path: '/about', label: t('nav.about') },
  ]

  const stateLabel = useMemo(() => {
    if (!status) {
      return t('common.notConnected')
    }
    return `${status.battery.currentChargePercent}% · ${translateBatteryState(t, status.battery.state)}`
  }, [status, t])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-soft text-foreground">
      <header className="drag-region flex h-12 shrink-0 items-center border-b border-border bg-surface/90 px-5 backdrop-blur-sm">
        <div className="w-[88px] shrink-0" />
        <div className="flex-1" />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface px-5 py-5">
          <div className="no-drag mb-6 flex shrink-0 items-center gap-3">
            <img src={appLogo} alt={t('common.appName')} className="h-12 w-12" />
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground">{t('common.appName')}</div>
              <div className="mt-1 text-xs leading-5 text-muted">{t('common.appSubtitle')}</div>
            </div>
          </div>

          <nav className="no-drag flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface-soft hover:text-foreground'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="no-drag mt-5 shrink-0 space-y-3 rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">{t('shell.liveStatus')}</div>
              <div className="mt-1 font-semibold text-foreground">{stateLabel}</div>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => refresh()}>
              {t('common.refreshNow')}
            </Button>
            <div className="text-xs text-muted">{t('shell.appVersion', { version })}</div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
