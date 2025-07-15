'use client'

import { motion } from 'framer-motion'

import { Exercise } from './exercise-card'
import { ExerciseSelectionReview } from './exercise-selection-review'

interface ManualReviewStepProps {
  existingExercises?: Exercise[]
  selectedExercises: Exercise[]
  onReorderExercises: (exercises: Exercise[]) => void
  onRemoveExercise: (exerciseId: string) => void
  isRemovingExercise?: boolean
}

export function ManualReviewStep({
  existingExercises = [],
  selectedExercises,
  onReorderExercises,
  onRemoveExercise,
  isRemovingExercise = false,
}: ManualReviewStepProps) {
  const hasSelectedExercises = selectedExercises.length > 0
  const validationMessage = !hasSelectedExercises
    ? 'Please go back and select at least one exercise for your workout.'
    : undefined

  return (
    <div className="space-y-6">
      {/* Exercise Review */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ExerciseSelectionReview
          existingExercises={existingExercises}
          selectedExercises={selectedExercises}
          onReorderExercises={onReorderExercises}
          onRemoveExercise={onRemoveExercise}
          isRemovingExercise={isRemovingExercise}
          validationMessage={validationMessage}
        />
      </motion.div>

      {/* Summary */}
      {hasSelectedExercises && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg"
        >
          Ready to start your workout with {selectedExercises.length} exercise
          {selectedExercises.length !== 1 ? 's' : ''}? You can reorder exercises
          by dragging or remove any you don't want.
        </motion.div>
      )}
    </div>
  )
}
