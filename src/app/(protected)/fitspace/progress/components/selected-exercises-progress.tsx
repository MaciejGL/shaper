'use client'

import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GQLExercisesProgressByUserQuery,
  useAvailableExercisesForProgressQuery,
} from '@/generated/graphql-client'

import { ExerciseEmptyState } from './exercise-empty-state'
import { ExerciseProgressChart } from './exercise-progress-chart'
import { TimePeriod } from './exercise-progress-constants'
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('12weeks')

  // Get available exercises for selection
  const { data: availableExercises, isLoading } =
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
  } = useExerciseProgress(exerciseProgress, userId)

  const hasAvailableExercises =
    availableExercises?.exercisesProgressByUser &&
    availableExercises.exercisesProgressByUser.length > 0

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
      {selectedExercises.length === 0 ? (
        <ExerciseEmptyState
          onOpenSelection={() => setIsOpen(true)}
          hasAvailableExercises={hasAvailableExercises}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {/* Time Period Selector */}
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger variant="ghost">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12weeks">Last 3 months</SelectItem>
              <SelectItem value="1year">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Exercise Charts */}
          <div className="grid gap-6">
            {selectedExercises.map((exercise, index) => (
              <ExerciseProgressChart
                key={exercise?.baseExercise?.id || index}
                exercise={exercise}
                timePeriod={timePeriod}
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
