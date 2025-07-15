import { useState } from 'react'

import { Exercise } from '@/app/(protected)/fitspace/workout/quick-workout/components/exercise-card'
import {
  handleExerciseSelection,
  prepareExercisesForSubmission,
  validateExerciseSelection,
} from '@/app/(protected)/fitspace/workout/quick-workout/utils/exercise-selection'
import { GQLBaseExercise, GQLMuscleGroup } from '@/generated/graphql-client'

/**
 * Type for exercises from GraphQL queries with required fields
 */
type GraphQLExercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
}

interface UseExerciseSelectionProps {
  allExercises: GraphQLExercise[]
}

/**
 * Custom hook for managing exercise selection state and logic
 * Handles adding/removing exercises, validation, and preparation for submission
 */
export function useExerciseSelection({
  allExercises,
}: UseExerciseSelectionProps) {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])

  // Handle exercise selection/deselection
  const handleExerciseSelect = (exerciseId: string) => {
    handleExerciseSelection({
      exerciseId,
      allExercises,
      selectedExercises,
      setSelectedExercises,
    })
  }

  // Reorder exercises (for drag and drop)
  const reorderExercises = (newOrder: Exercise[]) => {
    setSelectedExercises(newOrder)
  }

  // Clear all selected exercises
  const clearSelection = () => {
    setSelectedExercises([])
  }

  // Validate current selection
  const validationResult = validateExerciseSelection(selectedExercises)

  // Get selected exercise IDs for easy checking
  const selectedExerciseIds = selectedExercises.map((exercise) => exercise.id)

  // Check if an exercise is selected
  const isExerciseSelected = (exerciseId: string) => {
    return selectedExerciseIds.includes(exerciseId)
  }

  // Prepare exercises for API submission
  const prepareForSubmission = (existingExercisesCount: number) => {
    return prepareExercisesForSubmission({
      selectedExercises,
      existingExercisesCount,
    })
  }

  return {
    // State
    selectedExercises,
    selectedExerciseIds,

    // Computed values
    selectionCount: selectedExercises.length,
    hasSelection: selectedExercises.length > 0,
    validationResult,

    // Actions
    handleExerciseSelect,
    reorderExercises,
    clearSelection,
    isExerciseSelected,
    prepareForSubmission,
    setSelectedExercises,
  }
}
