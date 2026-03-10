import type { DesktopAPI } from '@shared/ipc'

declare global {
  interface Window {
    appAPI: DesktopAPI
  }
}

export {}
