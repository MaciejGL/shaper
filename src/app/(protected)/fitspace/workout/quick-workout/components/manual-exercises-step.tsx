'use client'

import { motion } from 'framer-motion'

import { ExercisesList } from '../../[trainingId]/components/exercises-list'

import { Exercise } from './exercise-card'

interface ManualExercisesStepProps {
  filteredExercises: Exercise[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function ManualExercisesStep({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
  searchTerm,
  onSearchChange,
}: ManualExercisesStepProps) {
  return (
    <div className="space-y-6">
      {/* Selection count */}
      {selectedExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <span className="text-sm text-muted-foreground">
            {selectedExercises.length} exercise
            {selectedExercises.length !== 1 ? 's' : ''} selected
          </span>
        </motion.div>
      )}

      {/* Exercise list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ExercisesList
          selectedExercises={selectedExercises}
          onExerciseSelect={onExerciseSelect}
          filteredExercises={filteredExercises}
          onSearch={onSearchChange}
          searchTerm={searchTerm}
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg"
      >
        {selectedExercises.length === 0 ? (
          <>
            Choose exercises for your workout. Use search and filters to find
            what you need.
          </>
        ) : (
          <>
            {selectedExercises.length} exercise
            {selectedExercises.length !== 1 ? 's' : ''} selected. You can add
            more or continue to review your workout.
          </>
        )}
      </motion.div>
    </div>
  )
}
