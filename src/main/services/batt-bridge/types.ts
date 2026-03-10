import type { z } from 'zod'
import { z as zod } from 'zod'

const nullableOptional = <T extends zod.ZodTypeAny>(schema: T) =>
  zod.preprocess((value) => (value == null ? undefined : value), schema.optional())

export const battStatusSchema = zod.object({
  charging: zod.object({
    allowCharging: zod.boolean(),
    useAdapter: zod.boolean(),
    pluggedIn: zod.boolean(),
  }),
  battery: zod.object({
    currentChargePercent: zod.number(),
    state: zod.enum(['charging', 'discharging', 'full', 'notCharging']),
    timeToLimitMinutes: nullableOptional(zod.number()),
    fullCapacityMah: zod.number(),
    chargeRateWatts: zod.number(),
    voltageVolts: zod.number(),
  }),
  configuration: zod.object({
    enabled: zod.boolean(),
    upperLimitPercent: zod.number(),
    lowerLimitPercent: zod.number(),
    preventIdleSleep: zod.boolean(),
    disableChargingPreSleep: zod.boolean(),
    preventSystemSleep: zod.boolean(),
    allowNonRootAccess: zod.boolean(),
    controlMagSafeLed: zod
      .object({
        enabled: zod.boolean(),
        mode: zod.string(),
      })
      .optional(),
  }),
  calibration: zod
    .object({
      phase: zod.string(),
      startedAt: nullableOptional(zod.string()),
      paused: zod.boolean(),
      canPause: zod.boolean(),
      canCancel: zod.boolean(),
      message: zod.string(),
      schedule: zod.object({
        enabled: zod.boolean(),
        cron: zod.string(),
        scheduledAt: nullableOptional(zod.string()),
      }),
    })
    .optional(),
})

export const telemetrySchema = zod.object({
  power: zod
    .object({
      Battery: zod.object({
        CycleCount: zod.number(),
      }),
      Calculations: zod.object({
        ACPower: zod.number(),
        BatteryPower: zod.number(),
        SystemPower: zod.number(),
        HealthByMaxCapacity: zod.number(),
      }),
    })
    .optional(),
  calibration: zod
    .object({
      phase: zod.string(),
      chargePercent: nullableOptional(zod.number()),
      pluggedIn: nullableOptional(zod.boolean()),
      remainingHoldSeconds: nullableOptional(zod.number()),
      startedAt: nullableOptional(zod.string()),
      paused: zod.boolean(),
      canPause: zod.boolean(),
      canCancel: zod.boolean(),
      message: zod.string(),
      targetPercent: nullableOptional(zod.number()),
      scheduledAt: nullableOptional(zod.string()),
    })
    .optional(),
})

export type BattStatusDTO = z.infer<typeof battStatusSchema>
export type TelemetryDTO = z.infer<typeof telemetrySchema>
