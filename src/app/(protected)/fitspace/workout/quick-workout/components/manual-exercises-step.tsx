'use client'

import { motion } from 'framer-motion'

import { GQLEquipment } from '@/generated/graphql-client'

import { EnhancedExercisesList } from './enhanced-exercises-list'
import { Exercise } from './exercise-card'

interface ManualExercisesStepProps {
  filteredExercises: Exercise[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  existingExercises?: Exercise[]

  // Filter props
  selectedMuscleGroups: string[]
  onMuscleGroupChange: (muscleGroups: string[]) => void
  selectedEquipment: GQLEquipment[]
  onEquipmentChange: (equipment: GQLEquipment[]) => void
}

export function ManualExercisesStep({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
  searchTerm,
  onSearchChange,
  existingExercises = [],
  selectedMuscleGroups,
  onMuscleGroupChange,
  selectedEquipment,
  onEquipmentChange,
}: ManualExercisesStepProps) {
  // Filter out exercises that are already in the existing workout
  const existingExerciseIds = existingExercises.map((ex) => ex.id)
  const availableExercises = filteredExercises.filter(
    (exercise) => !existingExerciseIds.includes(exercise.id),
  )

  return (
    <div className="space-y-6">
      {/* Show existing exercises count if any */}
      {existingExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <span className="text-sm text-muted-foreground">
            Your workout already has {existingExercises.length} exercise
            {existingExercises.length !== 1 ? 's' : ''}. Select additional
            exercises to add.
          </span>
        </motion.div>
      )}

      {/* Exercise list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EnhancedExercisesList
          selectedExercises={selectedExercises}
          onExerciseSelect={onExerciseSelect}
          filteredExercises={availableExercises}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupChange={onMuscleGroupChange}
          selectedEquipment={selectedEquipment}
          onEquipmentChange={onEquipmentChange}
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg mb-4"
      >
        {selectedExercises.length === 0 ? (
          <>
            {existingExercises.length > 0
              ? 'Choose additional exercises to add to your existing workout.'
              : 'Choose exercises for your workout. Use search and filters to find what you need.'}
          </>
        ) : (
          <>
            {selectedExercises.length} new exercise
            {selectedExercises.length !== 1 ? 's' : ''} selected. You can add
            more or continue to review your workout.
          </>
        )}
      </motion.div>
    </div>
  )
}
