import type { GQLEquipment, GQLWeightUnit } from '@/generated/graphql-client'

import type { SuggestedLoadRangeDisplay } from './suggested-load'

export type WorkoutSuggestionPreviousLogs =
  | {
      order: number
      log?: { reps?: number | null; weight?: number | null } | null
    }[]
  | null

export interface WorkoutSuggestionSetInput {
  setId: string
  order: number
  minReps: number | null
  maxReps: number | null
  loggedWeightKg?: number | null
}

export interface WorkoutSuggestionsListProps {
  sets: WorkoutSuggestionSetInput[]
  previousLogs: WorkoutSuggestionPreviousLogs
  weightUnit: GQLWeightUnit
  toDisplayWeight: (weightKg: number | null | undefined) => number | null
  equipment: GQLEquipment | null
  onApplySuggested?: (
    suggestions: { setId: string; suggestedWeightKg: number }[],
  ) => Promise<void>
  isApplyingSuggested?: boolean
}

export interface WorkoutSuggestionRowModel {
  setId: string
  order: number
  prevReps: number | null
  prevWeight: number | null
  prevWeightKg: number | null
  loggedWeight: number | null
  loggedWeightKg: number | null
  suggestionRange: SuggestedLoadRangeDisplay | null
  overshootReps: number | null
}

