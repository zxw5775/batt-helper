import type { InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Field({ label, children, hint }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="flex flex-col gap-2 text-sm text-foreground">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-foreground outline-none focus:border-accent')} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="rounded-xl border border-border bg-surface-soft px-3 py-2 text-sm text-foreground outline-none focus:border-accent" {...props} />
}
