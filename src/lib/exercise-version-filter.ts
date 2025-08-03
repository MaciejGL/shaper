/**
 * Exercise Version Filter Utility
 *
 * Provides centralized logic for filtering exercises by version
 * based on the EXERCISE_VERSION_FILTER environment variable.
 */

type ExerciseVersionFilter = 'v1' | 'v2' | 'both'

/**
 * Get the current exercise version filter from environment
 */
export function getExerciseVersionFilter(): ExerciseVersionFilter {
  const filter =
    process.env.EXERCISE_VERSION_FILTER?.toLowerCase() as ExerciseVersionFilter

  if (filter === 'v1' || filter === 'v2' || filter === 'both') {
    return filter
  }

  // Default to 'both' if not specified or invalid
  return 'both'
}

/**
 * Generate Prisma where clause for exercise version filtering
 */
export function getExerciseVersionWhereClause() {
  const filter = getExerciseVersionFilter()

  switch (filter) {
    case 'v1':
      return {
        version: { not: 2 }, // Include version 1 and null (legacy exercises)
      }
    case 'v2':
      return {
        version: 2, // Only version 2 (imported exercises)
      }
    case 'both':
    default:
      return {} // No version filter - include all
  }
}

/**
 * Check if a specific version is allowed
 */
export function isVersionAllowed(version: number): boolean {
  const filter = getExerciseVersionFilter()

  switch (filter) {
    case 'v1':
      return version !== 2
    case 'v2':
      return version === 2
    case 'both':
    default:
      return true
  }
}

/**
 * Get human-readable description of current filter
 */
export function getExerciseVersionDescription(): string {
  const filter = getExerciseVersionFilter()

  switch (filter) {
    case 'v1':
      return 'Manual exercises only (V1)'
    case 'v2':
      return 'Imported exercises only (V2)'
    case 'both':
    default:
      return 'All exercise versions (V1 & V2)'
  }
}
