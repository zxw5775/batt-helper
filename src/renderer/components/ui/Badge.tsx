import clsx from 'clsx'

export function Badge({ tone = 'default', children }: { tone?: 'default' | 'success' | 'warning' | 'danger'; children: string }) {
  return (
    <span
      className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', {
        'bg-surface-soft text-muted': tone === 'default',
        'bg-success/10 text-success': tone === 'success',
        'bg-warning/10 text-warning': tone === 'warning',
        'bg-danger/10 text-danger': tone === 'danger',
      })}
    >
      {children}
    </span>
  )
}
