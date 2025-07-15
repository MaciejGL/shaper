import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'

import { AiExerciseList } from './results/ai-exercise-list'
import { WorkoutSummaryCard } from './results/workout-summary-card'

interface AiResultsStepProps {
  data: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'] | null
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function AiResultsStep({
  data,
  isLoading = false,
  error = null,
  onRetry,
}: AiResultsStepProps) {
  const exercises = data?.exercises || []

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Workout Summary */}
      <WorkoutSummaryCard data={data} />

      {/* Exercise List */}
      <AiExerciseList exercises={exercises} />
    </div>
  )
}

function LoadingState() {
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
            <Sparkles className="h-6 w-6" />
          </motion.div>
          <span className="text-lg font-medium">
            Generating your workout...
          </span>
        </div>
        <p className="text-muted-foreground">
          Our AI is analyzing your preferences and selecting the best exercises
          for you.
        </p>
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
    <div className="space-y-4 text-center">
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
