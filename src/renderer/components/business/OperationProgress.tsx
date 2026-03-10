import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'

interface OperationProgressProps {
  visible: boolean
  title: string
  description: string
  steps: string[]
  currentStep: number
}

export function OperationProgress({ visible, title, description, steps, currentStep }: OperationProgressProps) {
  const { t } = useTranslation()

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-xl space-y-5 border-none">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          <div className="space-y-2">
            <h3 className="m-0 text-xl font-semibold">{title}</h3>
            <p className="m-0 text-sm text-muted">{description}</p>
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(12, ((currentStep + 1) / Math.max(steps.length, 1)) * 100)}%` }} />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const done = index < currentStep
            const active = index === currentStep
            return (
              <div key={`${step}-${index}`} className="flex items-center gap-3 text-sm">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    done ? 'border-success bg-success/10 text-success' : active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted'
                  }`}
                >
                  {done ? '✓' : active ? '•' : index + 1}
                </div>
                <div className={active ? 'font-medium text-foreground' : 'text-muted'}>{step}</div>
                {active ? <div className="text-xs text-muted">{t('progress.running')}</div> : null}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
