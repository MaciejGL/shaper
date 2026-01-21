import { GQLEquipment, GQLWeightUnit } from '@/generated/graphql-client'

export type SuggestedLoadEquipmentProfile =
  | 'dumbbell'
  | 'barbell'
  | 'machine'
  | 'other'

export type SuggestedLoadWeightBand = {
  upTo: number
  minStep: number
  maxDeltaCap: number
}

export type SuggestedLoadUnitConfig = {
  bandsByProfile: Record<
    SuggestedLoadEquipmentProfile,
    SuggestedLoadWeightBand[]
  >
  overshootMultiplier: { upToReps: number; multiplier: number }[]
}

export type SuggestedLoadConfig = {
  equipmentProfileByEquipment: Partial<
    Record<GQLEquipment, SuggestedLoadEquipmentProfile>
  >
  byUnit: Record<GQLWeightUnit, SuggestedLoadUnitConfig>
}

export const SUGGESTED_LOAD_CONFIG: SuggestedLoadConfig = {
  equipmentProfileByEquipment: {
    [GQLEquipment.Dumbbell]: 'dumbbell',
    [GQLEquipment.Kettlebell]: 'dumbbell',

    [GQLEquipment.Barbell]: 'barbell',
    [GQLEquipment.EzBar]: 'barbell',
    [GQLEquipment.TrapBar]: 'barbell',
    [GQLEquipment.SmithMachine]: 'barbell',

    [GQLEquipment.Machine]: 'machine',
    [GQLEquipment.Cable]: 'machine',
  },
  byUnit: {
    [GQLWeightUnit.Kg]: {
      bandsByProfile: {
        dumbbell: [
          // Common fixed dumbbells: 5->6->7... (small steps, capped)
          { upTo: 10, minStep: 1, maxDeltaCap: 1 },
          { upTo: 20, minStep: 1, maxDeltaCap: 2 },
          { upTo: 30, minStep: 2, maxDeltaCap: 4 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 2, maxDeltaCap: 6 },
        ],
        barbell: [
          // Plates: 1.25kg/2.5kg steps are common; cap small weights conservatively
          { upTo: 40, minStep: 1.25, maxDeltaCap: 2.5 },
          { upTo: 80, minStep: 2.5, maxDeltaCap: 5 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 2.5, maxDeltaCap: 7.5 },
        ],
        machine: [
          // Selectorized machines often have smaller steps than plates
          { upTo: 20, minStep: 1, maxDeltaCap: 3 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 2.5, maxDeltaCap: 5 },
        ],
        other: [{ upTo: Number.POSITIVE_INFINITY, minStep: 1, maxDeltaCap: 3 }],
      },
      // How much to widen the range when user exceeds the top of the rep range.
      // overshoot=0 (hit top) -> multiplier 1
      // overshoot 1-2 -> multiplier 2 (give a real choice)
      // overshoot 3-4 -> multiplier 3
      // overshoot 5+ -> multiplier 4
      overshootMultiplier: [
        { upToReps: 0, multiplier: 1 },
        { upToReps: 2, multiplier: 2 },
        { upToReps: 4, multiplier: 3 },
        { upToReps: Number.POSITIVE_INFINITY, multiplier: 4 },
      ],
    },
    [GQLWeightUnit.Lbs]: {
      bandsByProfile: {
        dumbbell: [
          { upTo: 25, minStep: 2.5, maxDeltaCap: 5 },
          { upTo: 60, minStep: 5, maxDeltaCap: 10 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 5, maxDeltaCap: 15 },
        ],
        barbell: [
          { upTo: 135, minStep: 5, maxDeltaCap: 10 },
          { upTo: 225, minStep: 5, maxDeltaCap: 15 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 10, maxDeltaCap: 30 },
        ],
        machine: [
          { upTo: 100, minStep: 5, maxDeltaCap: 15 },
          { upTo: Number.POSITIVE_INFINITY, minStep: 10, maxDeltaCap: 25 },
        ],
        other: [
          { upTo: Number.POSITIVE_INFINITY, minStep: 5, maxDeltaCap: 10 },
        ],
      },
      overshootMultiplier: [
        { upToReps: 0, multiplier: 1 },
        { upToReps: 2, multiplier: 2 },
        { upToReps: 4, multiplier: 3 },
        { upToReps: Number.POSITIVE_INFINITY, multiplier: 4 },
      ],
    },
  },
}
