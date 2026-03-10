import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CommandResult } from '@shared/batt'
import { Card } from '@renderer/components/ui/Card'
import { Button } from '@renderer/components/ui/Button'
import { Field, Input } from '@renderer/components/ui/Field'
import { useBattStore } from '@renderer/store/batt.store'
import { useAppStore } from '@renderer/store/app.store'
import { translateBatteryState } from '@renderer/services/translation'

export default function CalibrationPage() {
  const { t } = useTranslation()
  const status = useBattStore((state) => state.status)
  const runAction = useBattStore((state) => state.runAction)
  const pushToast = useAppStore((state) => state.pushToast)
  const [threshold, setThreshold] = useState(15)
  const [holdDuration, setHoldDuration] = useState(120)
  const [cron, setCron] = useState('0 10 * * 0')

  useEffect(() => {
    if (status?.calibration?.schedule.cron) {
      setCron(status.calibration.schedule.cron)
    }
  }, [status?.calibration?.schedule.cron])

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
        <h1 className="m-0 text-3xl font-semibold">{t('calibration.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('calibration.subtitle')}</p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">{t('calibration.currentPhase')}</div>
            <div className="mt-2 text-2xl font-semibold">{translateBatteryState(t, status?.calibration?.phase ?? 'idle')}</div>
          </div>
          <div className="text-sm text-muted">{status?.calibration?.message ?? t('calibration.notStarted')}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => doAction(() => window.appAPI.batt.calibrationStart())}>{t('calibration.start')}</Button>
          <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.calibrationPause())}>{t('calibration.pause')}</Button>
          <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.calibrationResume())}>{t('calibration.resume')}</Button>
          <Button variant="danger" onClick={() => doAction(() => window.appAPI.batt.calibrationCancel())}>{t('calibration.cancel')}</Button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-muted">
          <div>{t('calibration.pluggedIn')}：{status?.calibration?.pluggedIn ? t('calibration.plugged') : t('calibration.unplugged')}</div>
          <div>{t('calibration.currentCharge')}：{status?.calibration?.chargePercent ?? '--'}%</div>
          <div>{t('calibration.nextSchedule')}：{status?.calibration?.schedule.scheduledAt ?? t('common.unavailable')}</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <Card className="space-y-4">
          <Field label={t('calibration.threshold')} hint={t('calibration.thresholdHint')}>
            <Input type="number" min={10} max={50} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
          </Field>
          <Field label={t('calibration.holdDuration')} hint={t('calibration.holdDurationHint')}>
            <Input type="number" min={10} max={1440} value={holdDuration} onChange={(event) => setHoldDuration(Number(event.target.value))} />
          </Field>
          <div className="flex gap-3">
            <Button onClick={() => doAction(() => window.appAPI.batt.setCalibrationThreshold(threshold))}>{t('calibration.saveThreshold')}</Button>
            <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.setCalibrationHoldDuration(holdDuration))}>{t('calibration.saveHoldDuration')}</Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <Field label={t('calibration.cron')} hint={t('calibration.cronHint')}>
            <Input value={cron} onChange={(event) => setCron(event.target.value)} />
          </Field>
          <div className="flex gap-3">
            <Button
              onClick={async () => {
                try {
                  const result = await runAction(() => window.appAPI.batt.scheduleSet(cron))
                  pushToast('success', result.enabled ? t('calibration.scheduleEnabled', { cron: result.cron }) : t('calibration.scheduleUpdated'))
                } catch (error) {
                  pushToast('error', error instanceof Error ? error.message : t('toast.setLimitFailed'))
                }
              }}
            >
              {t('calibration.enableOrUpdate')}
            </Button>
            <Button variant="secondary" onClick={() => doAction(() => window.appAPI.batt.scheduleDisable())}>{t('calibration.disableSchedule')}</Button>
          </div>
          <div className="rounded-2xl bg-surface-soft p-4 text-sm text-muted">
            <div>{t('calibration.currentCron', { value: status?.calibration?.schedule.cron || t('common.notInstalled') })}</div>
            <div className="mt-2">{t('calibration.riskHint')}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
