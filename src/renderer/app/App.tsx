import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@renderer/components/layout/AppShell'
import { StatusBanner } from '@renderer/components/business/StatusBanner'
import { ToastHost } from '@renderer/components/business/ToastHost'
import DashboardPage from '@renderer/pages/Dashboard'
import ChargingPage from '@renderer/pages/Charging'
import HealthPage from '@renderer/pages/Health'
import CalibrationPage from '@renderer/pages/Calibration'
import SettingsPage from '@renderer/pages/Settings'
import AboutPage from '@renderer/pages/About'
import OnboardingPage from '@renderer/pages/Onboarding'
import { useSettingsStore } from '@renderer/store/settings.store'
import { useBattStore } from '@renderer/store/batt.store'
import { useAppStore } from '@renderer/store/app.store'

function AppContent() {
  const { t } = useTranslation()
  const settings = useSettingsStore((state) => state.settings)
  const error = useBattStore((state) => state.error)
  const diagnostics = useBattStore((state) => state.diagnostics)
  const refreshDiagnostics = useBattStore((state) => state.refreshDiagnostics)

  if (!settings.hasCompletedOnboarding || (diagnostics && !diagnostics.available)) {
    return <OnboardingPage />
  }

  return (
    <HashRouter>
      <div className="space-y-4">
        {error ? (
          <div className="px-8 pt-6">
            <StatusBanner
              tone={diagnostics?.available ? 'warning' : 'danger'}
              message={error}
              action={{ label: t('banner.retryDetection'), onClick: () => void refreshDiagnostics() }}
            />
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="charging" element={<ChargingPage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="calibration" element={<CalibrationPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastHost />
    </HashRouter>
  )
}

export default function App() {
  const { t } = useTranslation()
  const loaded = useSettingsStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const initBatt = useBattStore((state) => state.init)
  const refresh = useBattStore((state) => state.refresh)
  const diagnostics = useBattStore((state) => state.diagnostics)
  const setVersion = useAppStore((state) => state.setVersion)

  useEffect(() => {
    void (async () => {
      await loadSettings()
      await initBatt()
      const version = await window.appAPI.app.getVersion()
      setVersion(version)
    })()
  }, [initBatt, loadSettings, setVersion])

  useEffect(() => {
    if (!loaded || !diagnostics?.available) {
      return
    }
    const timer = window.setInterval(() => {
      void refresh()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [diagnostics?.available, loaded, refresh])

  if (!loaded) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">{t('common.loading')}</div>
  }

  return <AppContent />
}
