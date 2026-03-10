import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx('rounded-2xl border border-border bg-surface p-5 shadow-card', className)}>{children}</section>
}
