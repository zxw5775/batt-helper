import { useTranslation } from 'react-i18next'
import { Card } from '@renderer/components/ui/Card'
import { useBattStore } from '@renderer/store/batt.store'

export default function HealthPage() {
  const { t } = useTranslation()
  const status = useBattStore((state) => state.status)

  const getAdvice = (health?: number, cycle?: number) => {
    if (health == null || cycle == null) {
      return t('health.advicePending')
    }
    if (health >= 90 && cycle < 300) {
      return t('health.adviceExcellent')
    }
    if (health >= 80) {
      return t('health.adviceGood')
    }
    return t('health.adviceFair')
  }

  if (!status) {
    return <div className="text-sm text-muted">{t('health.empty')}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold">{t('health.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('health.subtitle')}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-muted">{t('health.healthPercent')}</div>
          <div className="mt-3 text-3xl font-semibold">{status.telemetry?.healthPercent ?? '--'}%</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t('health.cycleCount')}</div>
          <div className="mt-3 text-3xl font-semibold">{status.telemetry?.cycleCount ?? '--'}</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t('health.fullCapacity')}</div>
          <div className="mt-3 text-3xl font-semibold">{status.battery.fullCapacityMah} mAh</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">{t('health.currentRate')}</div>
          <div className="mt-3 text-3xl font-semibold">{status.battery.chargeRateWatts} W</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="space-y-3">
          <div className="text-sm font-medium">{t('health.electrical')}</div>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted">
            <div>{t('health.voltage', { value: status.battery.voltageVolts })}</div>
            <div>{t('health.systemPower', { value: status.telemetry?.systemPowerWatts?.toFixed(1) ?? '--' })}</div>
            <div>{t('health.acPower', { value: status.telemetry?.acPowerWatts?.toFixed(1) ?? '--' })}</div>
            <div>{t('health.batteryPower', { value: status.telemetry?.batteryPowerWatts?.toFixed(1) ?? '--' })}</div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="text-sm font-medium">{t('health.advice')}</div>
          <p className="m-0 text-sm leading-6 text-muted">{getAdvice(status.telemetry?.healthPercent, status.telemetry?.cycleCount)}</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-muted">
            <li>{t('health.tip1')}</li>
            <li>{t('health.tip2')}</li>
            <li>{t('health.tip3')}</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
