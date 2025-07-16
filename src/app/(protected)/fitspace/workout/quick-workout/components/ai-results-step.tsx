import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'

import { AiWorkoutInputData } from './ai-workout-input'
import { WorkoutSummary } from './controls/workout-summary'
import { AiExerciseList } from './results/ai-exercise-list'

interface AiResultsStepProps {
  data: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'] | null
  inputData: AiWorkoutInputData
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onExercisesReorder?: (
    exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'],
  ) => void
}

export function AiResultsStep({
  data,
  inputData,
  isLoading = false,
  error = null,
  onRetry,
  onExercisesReorder,
}: AiResultsStepProps) {
  const [exercises, setExercises] = useState<
    GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises']
  >([])

  // Update local exercises state when data changes
  useEffect(() => {
    if (data?.exercises) {
      setExercises(data.exercises)
    }
  }, [data?.exercises])

  const handleReorderExercises = (
    reorderedExercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'],
  ) => {
    setExercises(reorderedExercises)
    onExercisesReorder?.(reorderedExercises)
  }

  if (isLoading) {
    return <LoadingState inputData={inputData} />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Exercise List */}
      <AiExerciseList
        exercises={exercises}
        onReorderExercises={handleReorderExercises}
      />
    </div>
  )
}

function LoadingState({ inputData }: { inputData: AiWorkoutInputData }) {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-6 w-6 animate-pulse" />
          </motion.div>
          <span className="text-lg font-medium animate-pulse">
            Generating your workout...
          </span>
        </div>
        <p className="text-muted-foreground">
          We are analyzing your preferences and selecting the best exercises for
          you.
        </p>
        {/* Summary */}
        {inputData && (
          <WorkoutSummary
            exerciseCount={inputData.exerciseCount}
            maxSetsPerExercise={inputData.maxSetsPerExercise}
            rpeRange={inputData.rpeRange}
            repFocus={inputData.repFocus}
            selectedMuscleGroups={inputData.selectedMuscleGroups}
            selectedEquipment={inputData.selectedEquipment}
          />
        )}
      </motion.div>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry?: () => void
}) {
  return (
    <div className="space-y-4 text-center flex flex-col items-center justify-center">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-destructive">
          Failed to generate workout
        </h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No workout generated</h3>
        <p className="text-muted-foreground">
          Please go back and adjust your preferences.
        </p>
      </div>
    </div>
  )
}
