import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OperationProgress } from '@renderer/components/business/OperationProgress'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { Field, Input, Select } from '@renderer/components/ui/Field'
import { useBattStore } from '@renderer/store/batt.store'
import { useSettingsStore } from '@renderer/store/settings.store'
import { useAppStore } from '@renderer/store/app.store'
import { translateInstallMethod } from '@renderer/services/translation'

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

export default function SettingsPage() {
  const { t } = useTranslation()
  const diagnostics = useBattStore((state) => state.diagnostics)
  const runAction = useBattStore((state) => state.runAction)
  const refreshDiagnostics = useBattStore((state) => state.refreshDiagnostics)
  const settings = useSettingsStore((state) => state.settings)
  const update = useSettingsStore((state) => state.update)
  const pushToast = useAppStore((state) => state.pushToast)
  const [busy, setBusy] = useState<BusyState>(idleBusyState)
  const updateInfo = diagnostics?.update

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

  const onUpdate = async <T,>(payload: T & object) => {
    try {
      await update(payload)
      pushToast('success', t('common.saveSuccess'))
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('common.saveFailed'))
    }
  }

  const handleCoreUpdate = async () => {
    try {
      if (updateInfo && !updateInfo.canAutoUpdate && updateInfo.releaseUrl) {
        window.open(updateInfo.releaseUrl, '_blank', 'noopener,noreferrer')
        return
      }

      const result = await runWithProgress(
        {
          title: t(diagnostics?.available ? 'progress.updateTitle' : 'progress.installTitle'),
          description: t(diagnostics?.available ? 'progress.updateDescription' : 'progress.installDescription'),
          steps: [t('progress.stepCheck'), t('progress.stepDownload'), t('progress.stepDaemon'), t('progress.stepRefresh')],
        },
        () => runAction(() => window.appAPI.batt.updateCore()),
      )
      pushToast('success', result.message)
      await refreshDiagnostics()
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('toast.updateFailed'))
    }
  }

  return (
    <>
      <OperationProgress {...busy} />
      <div className="space-y-6">
        <div>
          <h1 className="m-0 text-3xl font-semibold">{t('settings.title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('settings.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Card className="space-y-4">
            <Field label={t('settings.theme')}>
              <Select value={settings.theme} onChange={(event) => void onUpdate({ theme: event.target.value })}>
                <option value="system">{t('settings.themeSystem')}</option>
                <option value="light">{t('settings.themeLight')}</option>
                <option value="dark">{t('settings.themeDark')}</option>
              </Select>
            </Field>
            <Field label={t('settings.language')}>
              <Select value={settings.locale} onChange={(event) => void onUpdate({ locale: event.target.value })}>
                <option value="zh-CN">{t('settings.langZhCN')}</option>
                <option value="en-US">{t('settings.langEnUS')}</option>
              </Select>
            </Field>
          </Card>

          <Card className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
              <span>{t('settings.launchAtLogin')}</span>
              <input type="checkbox" checked={settings.launchAtLogin} onChange={(event) => void onUpdate({ launchAtLogin: event.target.checked })} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
              <span>{t('settings.startInTray')}</span>
              <input type="checkbox" checked={settings.startInTray} onChange={(event) => void onUpdate({ startInTray: event.target.checked })} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
              <span>{t('settings.minimizeToTray')}</span>
              <input type="checkbox" checked={settings.minimizeToTray} onChange={(event) => void onUpdate({ minimizeToTray: event.target.checked })} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3 text-sm">
              <span>{t('settings.notifications')}</span>
              <input type="checkbox" checked={settings.notificationsEnabled} onChange={(event) => void onUpdate({ notificationsEnabled: event.target.checked })} />
            </label>
          </Card>
        </div>

        <Card className="space-y-4">
          <Field label={t('settings.quickPresets')} hint={t('settings.quickPresetsHint')}>
            <Input
              value={settings.quickPresets.join(',')}
              onBlur={(event) => {
                const presets = event.target.value
                  .split(',')
                  .map((item) => Number(item.trim()))
                  .filter((item) => Number.isFinite(item) && item >= 10 && item <= 100)
                void onUpdate({ quickPresets: Array.from(new Set(presets)) })
              }}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{t('settings.coreVersion')}</div>
              <div className="mt-2 text-sm text-muted">
                {t('settings.installedAndLatest', {
                  installed: updateInfo?.installedVersion ?? diagnostics?.battVersion ?? t('common.notInstalled'),
                  latest: updateInfo?.latestVersion ?? t('common.unknownWithCheck'),
                })}
              </div>
              <div className="mt-2 text-sm text-muted">{t('settings.installMethod', { method: translateInstallMethod(t, updateInfo?.installMethod) })}</div>
            </div>
            {updateInfo?.updateAvailable ? <div className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">{t('settings.updatable')}</div> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleCoreUpdate()} disabled={busy.visible}>
              {updateInfo && !updateInfo.canAutoUpdate ? t('settings.openRelease') : diagnostics?.available ? t('settings.updateCore') : t('settings.installCore')}
            </Button>
            <Button variant="secondary" onClick={() => void refreshDiagnostics()} disabled={busy.visible}>{t('settings.checkLatest')}</Button>
            {updateInfo?.releaseUrl ? (
              <Button variant="ghost" onClick={() => window.open(updateInfo.releaseUrl, '_blank', 'noopener,noreferrer')} disabled={busy.visible}>
                {t('settings.releasePage')}
              </Button>
            ) : null}
          </div>

          <div className="text-xs leading-6 text-muted">{t('settings.coreFooter')}</div>
        </Card>
      </div>
    </>
  )
}
