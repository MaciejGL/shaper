import type { GQLEquipment, GQLWeightUnit } from '@/generated/graphql-client'
import { convertFromKg } from '@/lib/weight-utils'

import type {
  SuggestedLoadConfig,
  SuggestedLoadEquipmentProfile,
  SuggestedLoadWeightBand,
} from './suggested-load-config'
import { SUGGESTED_LOAD_CONFIG } from './suggested-load-config'

export type SuggestedLoadRangeDisplay = {
  minDelta: number
  maxDelta: number
  step: number
  defaultDelta: number
}

function resolveProfile(
  equipment: GQLEquipment | null | undefined,
  config: SuggestedLoadConfig,
): SuggestedLoadEquipmentProfile {
  if (!equipment) return 'other'
  return config.equipmentProfileByEquipment[equipment] ?? 'other'
}

function pickBand(
  bands: SuggestedLoadWeightBand[],
  displayWeight: number,
): SuggestedLoadWeightBand {
  const safe = Number.isFinite(displayWeight) ? Math.max(0, displayWeight) : 0
  return bands.find((b) => safe <= b.upTo) ?? bands[bands.length - 1]
}

function pickMultiplier(
  overshootReps: number,
  config: SuggestedLoadConfig['byUnit']['kg']['overshootMultiplier'],
): number {
  const safe = Number.isFinite(overshootReps) ? Math.max(0, overshootReps) : 0
  return config.find((r) => safe <= r.upToReps)?.multiplier ?? 1
}

function normalizeToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (!Number.isFinite(step) || step <= 0) return value
  // keep exact for common decimals (1, 1.25, 2.5, 5, 2.5lb etc)
  return Math.round(value / step) * step
}

export function getSuggestedLoadRangeDisplay({
  equipment,
  weightUnit,
  prevWeightKg,
  prevReps,
  minReps,
  maxReps,
  config = SUGGESTED_LOAD_CONFIG,
}: {
  equipment: GQLEquipment | null | undefined
  weightUnit: GQLWeightUnit
  prevWeightKg: number | null | undefined
  prevReps: number | null | undefined
  minReps: number | null
  maxReps: number | null
  config?: SuggestedLoadConfig
}): SuggestedLoadRangeDisplay | null {
  if (!Number.isFinite(prevWeightKg) || (prevWeightKg ?? 0) <= 0) return null
  if (!Number.isFinite(prevReps) || (prevReps ?? 0) <= 0) return null

  const target =
    typeof maxReps === 'number'
      ? maxReps
      : typeof minReps === 'number'
        ? minReps
        : null
  if (!target || target <= 0) return null

  // Suggest increase when user hits the top of the range (or above)
  if ((prevReps as number) < target) return null

  const overshoot = (prevReps as number) - target // >= 0

  const unitConfig = config.byUnit[weightUnit]
  const profile = resolveProfile(equipment, config)
  const currentDisplayWeight = convertFromKg(prevWeightKg as number, weightUnit)
  const band = pickBand(
    unitConfig.bandsByProfile[profile],
    currentDisplayWeight,
  )
  const multiplier = pickMultiplier(overshoot, unitConfig.overshootMultiplier)

  const step = band.minStep
  const minDelta = step
  const maxDeltaRaw = Math.min(band.maxDeltaCap, step * multiplier)
  const maxDelta = Math.max(minDelta, normalizeToStep(maxDeltaRaw, step))

  return {
    minDelta,
    maxDelta,
    step,
    defaultDelta: minDelta,
  }
}
