/**
 * Calculate estimated 1RM (one-rep max) using scientifically-backed formulas
 *
 * Uses different formulas based on rep ranges for optimal accuracy:
 * - Brzycki formula for 1-10 reps (most accurate)
 * - O'Conner formula for 11-15 reps
 * - Conservative estimate for 16+ reps
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) {
    return 0
  }

  if (reps <= 10) {
    // Brzycki formula - most accurate for 1-10 reps
    return weight / (1.0278 - 0.0278 * reps)
  } else if (reps <= 15) {
    // O'Conner formula - better for 11-15 reps
    return weight * (1 + 0.025 * reps)
  } else {
    // Conservative estimate for 16+ reps
    return weight * 1.5
  }
}

/**
 * Check if a given performance would be a personal record
 * Uses 1% improvement threshold to account for measurement variations
 * Filters out unrealistic improvements (>50%) that usually indicate first-time logging
 */
export function isPersonalRecord(
  currentWeight: number,
  currentReps: number,
  previousBest1RM: number,
  improvementThreshold: number = 1.01,
  maxRealisticImprovement: number = 50,
): boolean {
  if (previousBest1RM <= 0) {
    return false // First time logging - not a meaningful PR
  }

  const current1RM = calculateEstimated1RM(currentWeight, currentReps)
  const isAboveThreshold = current1RM > previousBest1RM * improvementThreshold

  if (!isAboveThreshold) {
    return false
  }

  // Check if improvement is realistic (not a first-time log or data error)
  const improvementPercent =
    ((current1RM - previousBest1RM) / previousBest1RM) * 100
  return improvementPercent <= maxRealisticImprovement
}

/**
 * Calculate improvement percentage between current and previous 1RM
 */
export function calculateImprovementPercentage(
  currentWeight: number,
  currentReps: number,
  previousBest1RM: number,
): number {
  if (previousBest1RM <= 0) {
    return 100 // First time = 100% improvement
  }

  const current1RM = calculateEstimated1RM(currentWeight, currentReps)
  return ((current1RM - previousBest1RM) / previousBest1RM) * 100
}
