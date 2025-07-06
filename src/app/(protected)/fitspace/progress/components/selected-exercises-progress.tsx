'use client'

import { useState } from 'react'

import { Loader } from '@/components/loader'
import {
  GQLExercisesProgressByUserQuery,
  useAvailableExercisesForProgressQuery,
} from '@/generated/graphql-client'

import { ExerciseEmptyState } from './exercise-empty-state'
import { ExerciseProgressChart } from './exercise-progress-chart'
import { ExerciseSelection } from './exercise-selection'
import { Section } from './section'
import { useExerciseProgress } from './use-exercise-progress'

interface SelectedExercisesProgressProps {
  exerciseProgress: GQLExercisesProgressByUserQuery['exercisesProgressByUser']
  userId: string | null
}

export function SelectedExercisesProgress({
  exerciseProgress,
  userId,
}: SelectedExercisesProgressProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get available exercises for selection
  const { data: availableExercises, isLoading: isLoadingAvailableExercises } =
    useAvailableExercisesForProgressQuery(
      { userId: userId! },
      { enabled: !!userId },
    )

  const {
    selectedExerciseIds,
    selectedExercises,
    handleExerciseSelectionChange,
    handleRemoveExercise,
    handleMoveToTop,
    isLoading: isLoadingExercises,
  } = useExerciseProgress(exerciseProgress, userId)

  const hasAvailableExercises =
    availableExercises?.exercisesProgressByUser &&
    availableExercises.exercisesProgressByUser.length > 0

  const isLoading = isLoadingExercises || isLoadingAvailableExercises

  return (
    <Section
      title="Exercises Progress"
      action={
        <ExerciseSelection
          availableExercises={availableExercises?.exercisesProgressByUser}
          selectedExerciseIds={selectedExerciseIds}
          onSelectionChange={handleExerciseSelectionChange}
          maxSelections={10}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isLoading={isLoading}
        />
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader />
        </div>
      ) : selectedExercises.length === 0 ? (
        <ExerciseEmptyState
          onOpenSelection={() => setIsOpen(true)}
          hasAvailableExercises={hasAvailableExercises}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid md:grid-cols-2 gap-6">
            {selectedExercises.map((exercise, index) => (
              <ExerciseProgressChart
                key={exercise?.baseExercise?.id || index}
                exercise={exercise}
                onRemoveExercise={handleRemoveExercise}
                onMoveToTop={handleMoveToTop}
                canMoveToTop={index > 0}
              />
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
