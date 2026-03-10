import { useTranslation } from 'react-i18next'
import { Card } from '@renderer/components/ui/Card'
import { useAppStore } from '@renderer/store/app.store'

export default function AboutPage() {
  const { t } = useTranslation()
  const version = useAppStore((state) => state.version)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold">{t('about.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('about.subtitle')}</p>
      </div>

      <Card className="space-y-3">
        <div className="text-lg font-semibold">{t('common.appName')}</div>
        <div className="text-sm text-muted">{t('about.version', { version })}</div>
        <div className="text-sm text-muted">{t('about.author')}</div>
        <div className="text-sm text-muted">{t('about.corePowered')}</div>
        <div className="text-sm text-muted">{t('about.battAuthor')}</div>
        <a className="text-sm text-accent" href="https://github.com/charlie0129/batt" target="_blank" rel="noreferrer noopener">
          {t('about.repo')}
        </a>
      </Card>

      <Card className="space-y-3">
        <div className="text-sm font-medium">{t('about.scope')}</div>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-muted">
          <li>{t('about.scope1')}</li>
          <li>{t('about.scope2')}</li>
          <li>{t('about.scope3')}</li>
          <li>{t('about.scope4')}</li>
        </ul>
      </Card>
    </div>
  )
}
