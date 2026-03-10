import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useBattStore } from '@renderer/store/batt.store'
import { useSettingsStore } from '@renderer/store/settings.store'
import { useAppStore } from '@renderer/store/app.store'
import { Button } from '@renderer/components/ui/Button'
import { Card } from '@renderer/components/ui/Card'
import { Badge } from '@renderer/components/ui/Badge'
import { translateBatteryState, translateBoolean } from '@renderer/services/translation'

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-foreground">{value}</div>
      {hint ? <div className="mt-2 text-xs text-muted">{hint}</div> : null}
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const status = useBattStore((state) => state.status)
  const runAction = useBattStore((state) => state.runAction)
  const settings = useSettingsStore((state) => state.settings)
  const pushToast = useAppStore((state) => state.pushToast)

  const tone = useMemo(() => {
    if (!status) return 'default'
    if (status.battery.state === 'charging') return 'success'
    if (status.battery.state === 'discharging') return 'warning'
    return 'default'
  }, [status])

  if (!status) {
    return <div className="text-sm text-muted">{t('dashboard.empty')}</div>
  }

  const handlePreset = async (preset: number) => {
    try {
      const result = await runAction(() => window.appAPI.batt.setLimit(preset))
      pushToast('success', result.message)
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('toast.setLimitFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-3xl font-semibold">{t('dashboard.title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Badge tone={tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'default'}>{translateBatteryState(t, status.battery.state)}</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Metric label={t('dashboard.currentCharge')} value={`${status.battery.currentChargePercent}%`} hint={status.charging.pluggedIn ? t('dashboard.pluggedIn') : t('dashboard.unplugged')} />
        <Metric label={t('dashboard.strategy')} value={status.configuration.enabled ? `${status.configuration.upperLimitPercent}%` : t('dashboard.off')} hint={t('dashboard.lowerLimit', { value: status.configuration.lowerLimitPercent })} />
        <Metric
          label={t('dashboard.health')}
          value={`${status.telemetry?.healthPercent ?? '--'}%`}
          hint={status.telemetry?.cycleCount != null ? t('dashboard.cycleCount', { count: status.telemetry.cycleCount }) : t('common.unavailable')}
        />
        <Metric label={t('dashboard.systemPower')} value={`${status.telemetry?.systemPowerWatts?.toFixed(1) ?? '--'}W`} hint={t('dashboard.acPower', { value: status.telemetry?.acPowerWatts?.toFixed(1) ?? '--' })} />
      </div>

      <Card className="grid grid-cols-[1.6fr_1fr] gap-5">
        <div>
          <div className="text-sm text-muted">{t('dashboard.currentStatus')}</div>
          <div className="mt-3 text-5xl font-semibold">{status.battery.currentChargePercent}%</div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span>{t('dashboard.allowCharging')}：{translateBoolean(t, status.charging.allowCharging)}</span>
            <span>{t('dashboard.useAdapter')}：{translateBoolean(t, status.charging.useAdapter)}</span>
            <span>{t('dashboard.timeToLimit')}：{status.battery.timeToLimitMinutes ? t('dashboard.minutes', { value: status.battery.timeToLimitMinutes }) : t('common.unavailable')}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted">{t('dashboard.quickPresets')}</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {settings.quickPresets.map((preset) => (
              <Button key={preset} variant={preset === status.configuration.upperLimitPercent ? 'primary' : 'secondary'} onClick={() => handlePreset(preset)}>
                {preset}%
              </Button>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted">{t('dashboard.presetHint')}</div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-muted">{t('dashboard.chargeDischarge')}</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>{t('dashboard.status')}：{translateBatteryState(t, status.battery.state)}</div>
            <div>{t('dashboard.rate')}：{status.battery.chargeRateWatts}W</div>
            <div>{t('dashboard.voltage')}：{status.battery.voltageVolts}V</div>
          </div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t('dashboard.powerFlow')}</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>{t('dashboard.acPowerLabel')}：{status.telemetry?.acPowerWatts?.toFixed(1) ?? '--'}W</div>
            <div>{t('dashboard.batteryPowerLabel')}：{status.telemetry?.batteryPowerWatts?.toFixed(1) ?? '--'}W</div>
            <div>{t('dashboard.systemPowerLabel')}：{status.telemetry?.systemPowerWatts?.toFixed(1) ?? '--'}W</div>
          </div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t('dashboard.calibrationOverview')}</div>
          <div className="mt-3 space-y-2 text-sm">
            <div>{t('dashboard.phase')}：{translateBatteryState(t, status.calibration?.phase ?? 'idle')}</div>
            <div>{t('dashboard.schedule')}：{status.calibration?.schedule.enabled ? t('common.enabled') : t('common.disabled')}</div>
            <div>{t('dashboard.nextRun')}：{status.calibration?.schedule.scheduledAt ?? t('common.unavailable')}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
