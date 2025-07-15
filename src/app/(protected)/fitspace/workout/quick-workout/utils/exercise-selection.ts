import { toast } from 'sonner'

import { GQLBaseExercise, GQLMuscleGroup } from '@/generated/graphql-client'

import { Exercise } from '../components/exercise-card'

/**
 * Type for exercises from GraphQL queries with required fields
 */
type GraphQLExercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
}

// Constants for exercise selection
export const MAX_EXERCISES_LIMIT = 10

/**
 * Handles exercise selection with validation and limits
 */
export function handleExerciseSelection({
  exerciseId,
  allExercises,
  selectedExercises,
  setSelectedExercises,
}: {
  exerciseId: string
  allExercises: GraphQLExercise[]
  selectedExercises: Exercise[]
  setSelectedExercises: (
    exercises: Exercise[] | ((prev: Exercise[]) => Exercise[]),
  ) => void
}): void {
  const exercise = allExercises.find((ex) => ex.id === exerciseId)
  if (!exercise) return

  const isAlreadySelected = selectedExercises.some(
    (selectedExercise) => selectedExercise.id === exerciseId,
  )

  if (isAlreadySelected) {
    setSelectedExercises((prev) =>
      prev.filter((selectedExercise) => selectedExercise.id !== exerciseId),
    )
    return
  }

  if (selectedExercises.length >= MAX_EXERCISES_LIMIT) {
    toast.info(
      `You can only add up to ${MAX_EXERCISES_LIMIT} exercises at a time`,
    )
    return
  }

  setSelectedExercises((prev) => [...prev, exercise])
}

/**
 * Validates if exercises can be added to workout
 */
export function validateExerciseSelection(selectedExercises: Exercise[]): {
  isValid: boolean
  message?: string
} {
  if (selectedExercises.length === 0) {
    return {
      isValid: false,
      message: "You haven't selected any exercises yet.",
    }
  }

  if (selectedExercises.length > MAX_EXERCISES_LIMIT) {
    return {
      isValid: false,
      message: `You can only add up to ${MAX_EXERCISES_LIMIT} exercises at a time.`,
    }
  }

  return { isValid: true }
}

/**
 * Prepares exercises for API submission
 */
export function prepareExercisesForSubmission({
  selectedExercises,
  existingExercisesCount,
}: {
  selectedExercises: Exercise[]
  existingExercisesCount: number
}) {
  return selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    order: existingExercisesCount + index + 1, // Append new exercises after existing ones
  }))
}
