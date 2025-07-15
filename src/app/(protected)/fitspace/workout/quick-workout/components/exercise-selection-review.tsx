'use client'

import { Reorder } from 'framer-motion'

import { Exercise, ExerciseCard } from './exercise-card'

interface ExerciseSelectionReviewProps {
  // Existing workout exercises - using Exercise type for consistency
  existingExercises?: Exercise[]

  // Selected new exercises
  selectedExercises: Exercise[]
  onReorderExercises: (exercises: Exercise[]) => void
  onRemoveExercise: (exerciseId: string) => void

  // Loading states
  isRemovingExercise?: boolean

  // Validation
  validationMessage?: string
}

/**
 * Review component for displaying existing and new exercises in the workout
 * Handles reordering of new exercises and removal of existing ones
 */
export function ExerciseSelectionReview({
  existingExercises = [],
  selectedExercises,
  onReorderExercises,
  onRemoveExercise,
  isRemovingExercise = false,
  validationMessage,
}: ExerciseSelectionReviewProps) {
  const hasExistingExercises = existingExercises.length > 0
  const hasSelectedExercises = selectedExercises.length > 0
  const completedExerciseIds = existingExercises
    .filter((ex) => ex.completedAt)
    .map((ex) => ex.id)

  return (
    <div className="space-y-4">
      {/* Existing Exercises Section */}
      {hasExistingExercises && (
        <div>
          <p className="text-md font-medium">Already added exercises</p>
          <p className="text-sm text-muted-foreground mb-2">
            Exercises that already exist in your workout for today.
          </p>
          <div className="space-y-3">
            {existingExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                selectedExercises={completedExerciseIds}
                onExerciseRemove={() => onRemoveExercise(exercise.id)}
                loading={isRemovingExercise}
              />
            ))}
          </div>
        </div>
      )}

      {/* New Exercises Section Header */}
      {hasExistingExercises && (
        <p className="text-md font-medium mb-2">New exercises</p>
      )}

      {/* Validation Message */}
      {validationMessage && !hasSelectedExercises && (
        <div className="text-sm text-muted-foreground bg-card p-4 rounded-lg mt-2">
          {validationMessage}
        </div>
      )}

      {/* Selected Exercises - Reorderable */}
      {hasSelectedExercises && (
        <Reorder.Group
          axis="y"
          values={selectedExercises}
          onReorder={onReorderExercises}
          className="space-y-3"
        >
          {selectedExercises.map((exercise) => (
            <Reorder.Item key={exercise.id} value={exercise} dragElastic={0.1}>
              <ExerciseCard
                exercise={exercise}
                onExerciseRemove={() => onRemoveExercise(exercise.id)}
                isDraggable
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  )
}
