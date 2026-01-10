import { ExerciseSet } from './types'

/**
 * Formats the display reps for a set based on minReps, maxReps, or reps
 * Handles rep ranges (e.g., "8-12") and single rep targets
 */
export function formatDisplayReps(set: ExerciseSet): string | null {
  if (set.minReps) {
    return set.minReps === set.maxReps
      ? `${set.minReps}`
      : `${set.minReps}-${set.maxReps}`
  }
  if (set.maxReps) return `${set.maxReps}`
  if (set.reps) return `${set.reps}`
  return null
}

interface FormatDisplayWeightParams {
  weight: string
  targetDisplayWeight: string | null | undefined
  isAdvancedView: boolean
}

/**
 * Formats the display weight based on view mode and available values
 * Returns null in advanced view (inputs shown instead)
 */
export function formatDisplayWeight({
  weight,
  targetDisplayWeight,
  isAdvancedView,
}: FormatDisplayWeightParams): string | null {
  if (isAdvancedView) return null
  if (weight) return weight
  if (targetDisplayWeight) return targetDisplayWeight
  return '-'
}
