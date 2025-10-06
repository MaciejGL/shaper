import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'

import type { AiWorkoutInputData } from '../hooks/use-ai-workout-generation'

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
    <div className="space-y-6 text-center h-full">
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
        <p className="text-muted-foreground text-sm mb-12">
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
  useEffect(() => {
    // Capture error with PostHog
    posthog.captureException(error)
  }, [error])

  return (
    <div className="space-y-4 text-center flex flex-col items-center justify-center flex-center h-full">
      <div className="space-y-2 mb-12">
        <h3 className="text-lg font-semibold text-foreground">
          Oops! We couldn't generate your workout
        </h3>
        <p className="text-muted-foreground text-sm">
          We were unable to generate a workout for you. Please try again. If the
          problem persists, please to adjust your preferences and try again.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="tertiary">
          Try Again
        </Button>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="space-y-4 text-center flex flex-col items-center justify-center flex-center h-full">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Nothing to show yet</h3>
        <p className="text-muted-foreground text-sm">
          Your filters might be too picky. Head back and loosen things up - or
          maybe our AI is on a coffee break ☕
        </p>
      </div>
    </div>
  )
}
