import { Exercise } from '../types'

/**
 * Checks if a non-public exercise has a similar public exercise with the same name
 * @param currentExercise - The exercise to check
 * @param allExercises - All exercises in the current context
 * @returns The similar public exercise if found, otherwise null
 */
export function findSimilarPublicExercise(
  currentExercise: Exercise,
  allExercises: Exercise[],
): Exercise | null {
  // Only check for non-public exercises
  if (currentExercise.isPublic) {
    return null
  }

  // Normalize the current exercise name for comparison
  const normalizedCurrentName = currentExercise.name.toLowerCase().trim()

  // Find a public exercise with the same name (case-insensitive)
  const similarPublicExercise = allExercises.find(
    (exercise) =>
      exercise.id !== currentExercise.id && // Different exercise
      exercise.isPublic && // Must be public
      exercise.name.toLowerCase().trim() === normalizedCurrentName, // Same name
  )

  return similarPublicExercise || null
}

/**
 * Checks if a non-public exercise has any similar public exercises
 * @param currentExercise - The exercise to check
 * @param allExercises - All exercises in the current context
 * @returns boolean indicating if similar public exercise exists
 */
export function hasSimilarPublicExercise(
  currentExercise: Exercise,
  allExercises: Exercise[],
): boolean {
  return findSimilarPublicExercise(currentExercise, allExercises) !== null
}
