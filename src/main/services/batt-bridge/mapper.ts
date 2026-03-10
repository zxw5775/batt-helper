import type { BattStatus } from '@shared/batt'
import type { BattStatusDTO, TelemetryDTO } from './types'

export function mergeBattStatus(status: BattStatusDTO, telemetry?: TelemetryDTO): BattStatus {
  const next: BattStatus = {
    charging: status.charging,
    battery: status.battery,
    configuration: status.configuration,
    calibration: status.calibration,
  }

  if (telemetry?.power) {
    next.telemetry = {
      healthPercent: telemetry.power.Calculations.HealthByMaxCapacity,
      cycleCount: telemetry.power.Battery.CycleCount,
      acPowerWatts: telemetry.power.Calculations.ACPower,
      batteryPowerWatts: telemetry.power.Calculations.BatteryPower,
      systemPowerWatts: telemetry.power.Calculations.SystemPower,
    }
  }

  if (telemetry?.calibration) {
    next.calibration = {
      phase: telemetry.calibration.phase,
      startedAt: telemetry.calibration.startedAt,
      paused: telemetry.calibration.paused,
      canPause: telemetry.calibration.canPause,
      canCancel: telemetry.calibration.canCancel,
      message: telemetry.calibration.message,
      chargePercent: telemetry.calibration.chargePercent,
      pluggedIn: telemetry.calibration.pluggedIn,
      remainingHoldSeconds: telemetry.calibration.remainingHoldSeconds,
      targetPercent: telemetry.calibration.targetPercent,
      schedule: {
        enabled: status.calibration?.schedule.enabled ?? Boolean(telemetry.calibration.scheduledAt),
        cron: status.calibration?.schedule.cron ?? '',
        scheduledAt: telemetry.calibration.scheduledAt ?? status.calibration?.schedule.scheduledAt,
      },
    }
  }

  return next
}
