import { useEffect } from 'react'
import { useAppStore } from '@renderer/store/app.store'

export function ToastHost() {
  const toasts = useAppStore((state) => state.toasts)
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    if (!toasts.length) {
      return
    }

    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 3200))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts, dismissToast])

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-card ${
            toast.tone === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : toast.tone === 'error'
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-border bg-surface text-foreground'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
