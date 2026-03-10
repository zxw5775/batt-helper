import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import appLogo from '../../../../resources/brand/app-logo-primary.png'
import { OperationProgress } from '@renderer/components/business/OperationProgress'
import { Button } from '@renderer/components/ui/Button'
import { Card } from '@renderer/components/ui/Card'
import { useAppStore } from '@renderer/store/app.store'
import { useBattStore } from '@renderer/store/batt.store'
import { useSettingsStore } from '@renderer/store/settings.store'
import { translateBoolean, translateInstallMethod } from '@renderer/services/translation'

interface BusyState {
  visible: boolean
  title: string
  description: string
  steps: string[]
  currentStep: number
}

const idleBusyState: BusyState = {
  visible: false,
  title: '',
  description: '',
  steps: [],
  currentStep: 0,
}

export default function OnboardingPage() {
  const { t } = useTranslation()
  const diagnostics = useBattStore((state) => state.diagnostics)
  const runAction = useBattStore((state) => state.runAction)
  const refreshDiagnostics = useBattStore((state) => state.refreshDiagnostics)
  const updateSettings = useSettingsStore((state) => state.update)
  const pushToast = useAppStore((state) => state.pushToast)
  const [defaultLimit, setDefaultLimit] = useState(80)
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [busy, setBusy] = useState<BusyState>(idleBusyState)
  const updateInfo = diagnostics?.update

  const compatibilityText = useMemo(() => {
    if (!diagnostics?.platformSupported) {
      return t('onboarding.compatUnsupported')
    }
    if (!diagnostics.available) {
      return t('onboarding.compatMissing')
    }
    if (!diagnostics.daemonRunning) {
      return t('onboarding.compatDaemon')
    }
    return t('onboarding.compatReady')
  }, [diagnostics, t])

  const runWithProgress = async <T,>(config: Omit<BusyState, 'visible' | 'currentStep'>, task: () => Promise<T>) => {
    setBusy({ visible: true, currentStep: 0, ...config })
    let activeStep = 0
    const interval = window.setInterval(() => {
      activeStep = Math.min(activeStep + 1, Math.max(config.steps.length - 2, 0))
      setBusy((current) => ({ ...current, currentStep: activeStep }))
    }, 1600)

    try {
      const result = await task()
      window.clearInterval(interval)
      setBusy((current) => ({ ...current, currentStep: Math.max(current.steps.length - 1, 0) }))
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      return result
    } finally {
      window.clearInterval(interval)
      setBusy(idleBusyState)
    }
  }

  const complete = async () => {
    try {
      if (diagnostics?.daemonRunning) {
        await runAction(() => window.appAPI.batt.setLimit(defaultLimit))
      }
      await updateSettings({ launchAtLogin, hasCompletedOnboarding: true })
      pushToast('success', t('toast.welcome'))
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('errors.initFailed'))
    }
  }

  const handleCoreAction = async () => {
    try {
      if (diagnostics?.update && !diagnostics.update.canAutoUpdate && diagnostics.update.releaseUrl) {
        window.open(diagnostics.update.releaseUrl, '_blank', 'noopener,noreferrer')
        return
      }

      if (!diagnostics?.available || diagnostics.update?.updateAvailable) {
        const isInstall = !diagnostics?.available
        const result = await runWithProgress(
          {
            title: t(isInstall ? 'progress.installTitle' : 'progress.updateTitle'),
            description: t(isInstall ? 'progress.installDescription' : 'progress.updateDescription'),
            steps: [t('progress.stepCheck'), t('progress.stepDownload'), t('progress.stepDaemon'), t('progress.stepRefresh')],
          },
          () => runAction(() => window.appAPI.batt.updateCore()),
        )
        pushToast('success', result.message)
        await refreshDiagnostics()
        return
      }

      const result = await runWithProgress(
        {
          title: t('progress.repairTitle'),
          description: t('progress.repairDescription'),
          steps: [t('progress.stepCheck'), t('progress.stepDaemon'), t('progress.stepRefresh')],
        },
        () => runAction(() => window.appAPI.batt.installDaemon()),
      )
      pushToast('success', result.message)
      await refreshDiagnostics()
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('common.actionFailed'))
    }
  }

  const coreActionLabel = !diagnostics?.available
    ? t('onboarding.installLatest')
    : diagnostics.update && !diagnostics.update.canAutoUpdate
      ? t('onboarding.openRelease')
      : diagnostics.update?.updateAvailable
        ? t('onboarding.updateToLatest', { version: diagnostics.update.latestVersion ?? t('common.unknown') })
        : t('onboarding.repairDaemon')

  return (
    <>
      <OperationProgress {...busy} />
      <div className="flex h-screen flex-col overflow-hidden bg-surface-soft">
        <header className="drag-region flex h-12 shrink-0 items-center border-b border-border bg-surface/90 px-5 backdrop-blur-sm">
          <div className="w-[88px] shrink-0" />
          <div className="flex-1" />
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <div className="grid w-full max-w-6xl grid-cols-[1.2fr_1fr] gap-6">
          <Card className="no-drag flex flex-col justify-between bg-gradient-to-br from-accent/10 to-surface">
            <div>
              <img src={appLogo} alt={t('common.appName')} className="h-16 w-16" />
              <h1 className="mt-6 text-4xl font-semibold">{t('common.appName')}</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{t('onboarding.intro')}</p>
            </div>
            <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-muted">
              <li>{t('onboarding.bullet1')}</li>
              <li>{t('onboarding.bullet2')}</li>
              <li>{t('onboarding.bullet3')}</li>
            </ul>
          </Card>

          <Card className="no-drag space-y-5">
            <div>
              <div className="text-sm text-muted">{t('onboarding.step')}</div>
              <div className="mt-2 text-2xl font-semibold">{t('onboarding.title')}</div>
              <p className="mt-2 text-sm text-muted">{compatibilityText}</p>
            </div>

            <div className="rounded-2xl bg-surface-soft p-4 text-sm text-muted">
              <div>{t('onboarding.platformSupported')}：{translateBoolean(t, diagnostics?.platformSupported)}</div>
              <div>{t('onboarding.battAvailable')}：{translateBoolean(t, diagnostics?.available)}</div>
              <div>{t('onboarding.daemonRunning')}：{translateBoolean(t, diagnostics?.daemonRunning)}</div>
              <div>{t('onboarding.installMethod')}：{translateInstallMethod(t, updateInfo?.installMethod)}</div>
              <div>{t('onboarding.installedVersion')}：{updateInfo?.installedVersion ?? diagnostics?.battVersion ?? t('common.notInstalled')}</div>
              <div>{t('onboarding.latestVersion')}：{updateInfo?.latestVersion ?? t('common.unknownWithCheck')}</div>
              <div className="mt-2 break-all">{t('onboarding.binary')}：{diagnostics?.binaryPath ?? t('common.notInstalled')}</div>
            </div>

            {updateInfo?.updateAvailable ? (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                {t('onboarding.newVersion', {
                  current: updateInfo.installedVersion ?? t('common.notInstalled'),
                  latest: updateInfo.latestVersion ?? t('common.unknown'),
                })}
              </div>
            ) : null}

            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
                <span>{t('onboarding.defaultLimit')}</span>
                <select value={defaultLimit} onChange={(event) => setDefaultLimit(Number(event.target.value))} className="rounded-lg border border-border bg-surface px-2 py-1">
                  {[60, 70, 80, 90, 100].map((item) => (
                    <option key={item} value={item}>
                      {item}%
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
                <span>{t('onboarding.launchAtLogin')}</span>
                <input type="checkbox" checked={launchAtLogin} onChange={(event) => setLaunchAtLogin(event.target.checked)} />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleCoreAction()} disabled={busy.visible}>{coreActionLabel}</Button>
              <Button variant="secondary" onClick={() => void refreshDiagnostics()} disabled={busy.visible}>
                {t('onboarding.redetect')}
              </Button>
              <Button variant="secondary" onClick={() => void complete()} disabled={busy.visible}>
                {t('onboarding.complete')}
              </Button>
              {updateInfo?.releaseUrl ? (
                <Button variant="ghost" onClick={() => window.open(updateInfo.releaseUrl, '_blank', 'noopener,noreferrer')} disabled={busy.visible}>
                  {t('common.viewRelease')}
                </Button>
              ) : null}
            </div>

            <div className="text-xs leading-6 text-muted">{t('onboarding.footer')}</div>
          </Card>
          </div>
        </div>
      </div>
    </>
  )
}
