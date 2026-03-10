import { create } from 'zustand'

interface ToastItem {
  id: number
  tone: 'success' | 'error' | 'info'
  message: string
}

interface AppState {
  version: string
  toasts: ToastItem[]
  setVersion: (version: string) => void
  pushToast: (tone: ToastItem['tone'], message: string) => void
  dismissToast: (id: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  version: '0.0.0',
  toasts: [],
  setVersion: (version) => set({ version }),
  pushToast: (tone, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now() + Math.round(Math.random() * 1000), tone, message }],
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
