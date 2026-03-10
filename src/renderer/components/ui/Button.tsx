import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function Button({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        {
          'border-accent bg-accent text-white hover:opacity-90': variant === 'primary',
          'border-border bg-surface text-foreground hover:bg-surface-soft': variant === 'secondary',
          'border-danger bg-danger/10 text-danger hover:bg-danger/20': variant === 'danger',
          'border-transparent bg-transparent text-muted hover:text-foreground': variant === 'ghost',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
