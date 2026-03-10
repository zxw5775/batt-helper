import { useTranslation } from 'react-i18next'
import { Card } from '@renderer/components/ui/Card'
import { useAppStore } from '@renderer/store/app.store'

export default function AboutPage() {
  const { t } = useTranslation()
  const version = useAppStore((state) => state.version)
  const appRepoUrl = 'https://github.com/zxw5775/batt-helper'
  const battRepoUrl = 'https://github.com/charlie0129/batt'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="m-0 text-3xl font-semibold">{t('about.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('about.subtitle')}</p>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-medium">{t('about.appSection', { defaultValue: '当前应用' })}</div>
        <div className="text-lg font-semibold">{t('common.appName')}</div>
        <div className="text-sm text-muted">{t('about.version', { version })}</div>
        <div className="text-sm text-muted">{t('about.author')}</div>
        <div className="space-y-1 text-sm">
          <a className="block text-accent" href={appRepoUrl} target="_blank" rel="noreferrer noopener">
            {t('about.appRepo')}
          </a>
          <div className="text-xs text-muted">{appRepoUrl}</div>
        </div>
        <a className="text-sm text-accent" href="mailto:zxw5775@gmail.com" target="_blank" rel="noreferrer noopener">
          {t('about.contact')}
        </a>
      </Card>

      <Card className="space-y-3">
        <div className="text-sm font-medium">{t('about.battSection', { defaultValue: 'batt Core' })}</div>
        <div className="text-sm text-muted">{t('about.corePowered')}</div>
        <div className="text-sm text-muted">{t('about.battAuthor')}</div>
        <div className="space-y-1 text-sm">
          <a className="block text-accent" href={battRepoUrl} target="_blank" rel="noreferrer noopener">
            {t('about.repo')}
          </a>
          <div className="text-xs text-muted">{battRepoUrl}</div>
        </div>
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
