import { create } from 'zustand'
import type { BattDiagnostics, BattStatus, CommandResult, ScheduleInfo } from '@shared/batt'
import { getErrorMessage } from '../services/api'

interface BattState {
  status: BattStatus | null
  diagnostics: BattDiagnostics | null
  loading: boolean
  error: string | null
  consecutiveFailures: number
  init: () => Promise<void>
  refresh: () => Promise<void>
  refreshDiagnostics: () => Promise<void>
  runAction: <T extends CommandResult | ScheduleInfo>(task: () => Promise<T>) => Promise<T>
}

export const useBattStore = create<BattState>((set, get) => ({
  status: null,
  diagnostics: null,
  loading: false,
  error: null,
  consecutiveFailures: 0,
  init: async () => {
    set({ loading: true })
    await get().refreshDiagnostics()

    if (get().diagnostics?.available) {
      await get().refresh()
    } else {
      set({ status: null, error: null, consecutiveFailures: 0 })
    }

    set({ loading: false })
  },
  refreshDiagnostics: async () => {
    try {
      const diagnostics = await window.appAPI.batt.getDiagnostics()
      set((state) => ({
        diagnostics,
        error: diagnostics.available ? state.error : null,
        status: diagnostics.available ? state.status : null,
        consecutiveFailures: diagnostics.available ? state.consecutiveFailures : 0,
      }))
    } catch (error) {
      set({ diagnostics: null, status: null, error: getErrorMessage(error), consecutiveFailures: 0 })
    }
  },
  refresh: async () => {
    if (!get().diagnostics?.available) {
      set({ status: null, error: null, consecutiveFailures: 0 })
      return
    }

    try {
      const status = await window.appAPI.batt.getStatus()
      set({ status, error: null, consecutiveFailures: 0 })
    } catch (error) {
      const message = getErrorMessage(error)
      set((state) => ({
        error: message,
        consecutiveFailures: state.consecutiveFailures + 1,
        status: state.consecutiveFailures >= 2 ? null : state.status,
      }))
    }
  },
  runAction: async (task) => {
    const result = await task()
    await Promise.all([get().refreshDiagnostics(), get().refresh()])
    return result
  },
}))
