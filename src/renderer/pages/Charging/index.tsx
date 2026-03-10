import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CommandResult } from '@shared/batt'
import { useBattStore } from '@renderer/store/batt.store'
import { useAppStore } from '@renderer/store/app.store'
import { Button } from '@renderer/components/ui/Button'
import { Card } from '@renderer/components/ui/Card'
import { Field, Input } from '@renderer/components/ui/Field'

export default function ChargingPage() {
  const { t } = useTranslation()
  const status = useBattStore((state) => state.status)
  const runAction = useBattStore((state) => state.runAction)
  const pushToast = useAppStore((state) => state.pushToast)
  const [limit, setLimit] = useState(status?.configuration.upperLimitPercent ?? 80)
  const [delta, setDelta] = useState(Math.max(1, (status?.configuration.upperLimitPercent ?? 80) - (status?.configuration.lowerLimitPercent ?? 78)))

  if (!status) {
    return <div className="text-sm text-muted">{t('charging.empty')}</div>
  }

  const doAction = async (task: () => Promise<CommandResult>) => {
    try {
      const result = await runAction(task)
      pushToast('success', result.message)
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : t('common.actionFailed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold">{t('charging.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('charging.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="space-y-4">
          <Field label={t('charging.chargeLimit')} hint={t('charging.chargeLimitHint')}>
            <Input type="number" min={10} max={100} value={limit} onChange={(event) => setLimit(Number(event.target.value))} />
          </Field>
          <div className="flex gap-3">
            <Button onClick={() => doAction(() => window.appAPI.batt.setLimit(limit))}>{t('charging.applyLimit')}</Button>
            <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.disableLimit())}>{t('charging.disableLimit')}</Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[60, 70, 80, 90, 100].map((preset) => (
              <Button key={preset} variant="secondary" onClick={() => { setLimit(preset); void doAction(() => window.appAPI.batt.setLimit(preset)) }}>
                {preset}%
              </Button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <Field label={t('charging.lowerDelta')} hint={t('charging.lowerDeltaHint')}>
            <Input type="number" min={1} max={20} value={delta} onChange={(event) => setDelta(Number(event.target.value))} />
          </Field>
          <Button onClick={() => doAction(() => window.appAPI.batt.setLowerLimitDelta(delta))}>{t('charging.updateDelta')}</Button>
          <div className="rounded-2xl bg-surface-soft p-4 text-sm text-muted">
            {t('charging.currentStrategy', { upper: status.configuration.upperLimitPercent, lower: status.configuration.lowerLimitPercent })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="space-y-4">
          <div className="text-sm font-medium">{t('charging.adapterControl')}</div>
          <div className="text-sm text-muted">{t('charging.adapterHint')}</div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.setAdapter(true))}>{t('charging.enableAdapter')}</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!window.confirm(t('charging.forceDischargeConfirm'))) return
                void doAction(() => window.appAPI.batt.setAdapter(false))
              }}
            >
              {t('charging.forceDischarge')}
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="text-sm font-medium">{t('charging.sleepProtection')}</div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
              <span>{t('charging.preventIdleSleep')}</span>
              <input type="checkbox" checked={status.configuration.preventIdleSleep} onChange={(event) => void doAction(() => window.appAPI.batt.setPreventIdleSleep(event.target.checked))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
              <span>{t('charging.disableChargingPreSleep')}</span>
              <input
                type="checkbox"
                checked={status.configuration.disableChargingPreSleep}
                onChange={(event) => void doAction(() => window.appAPI.batt.setDisableChargingPreSleep(event.target.checked))}
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
              <span>{t('charging.preventSystemSleep')}</span>
              <input type="checkbox" checked={status.configuration.preventSystemSleep} onChange={(event) => void doAction(() => window.appAPI.batt.setPreventSystemSleep(event.target.checked))} />
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}
