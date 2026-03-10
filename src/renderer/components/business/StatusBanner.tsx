import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function StatusBanner({
  message,
  tone,
  action,
}: {
  message: string
  tone: 'warning' | 'danger'
  action?: { label: string; onClick: () => void }
}) {
  const { t } = useTranslation()

  return (
    <Card className="flex items-center justify-between gap-4 border-none bg-gradient-to-r from-warning/10 to-danger/10">
      <div className="flex items-center gap-3">
        <Badge tone={tone === 'danger' ? 'danger' : 'warning'}>{tone === 'danger' ? t('banner.danger') : t('banner.warning')}</Badge>
        <p className="m-0 text-sm text-foreground">{message}</p>
      </div>
      {action ? (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </Card>
  )
}
