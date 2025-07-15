import { motion } from 'framer-motion'
import { Clock, Info, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { VideoPreview } from '@/components/video-preview'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

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
  const [showReasoning, setShowReasoning] = useState(false)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                Your AI-Generated Workout
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              {data.aiMeta.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Duration */}
            {data.totalDuration && (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Estimated duration: {data.totalDuration} minutes
                </span>
              </div>
            )}

            {/* Reasoning Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReasoning(!showReasoning)}
              className="h-auto p-0 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
            >
              <Info className="h-4 w-4 mr-1" />
              {showReasoning ? 'Hide' : 'Show'} AI reasoning
            </Button>

            {showReasoning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/20 p-3 rounded-lg"
              >
                {data.aiMeta.reasoning}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Exercise List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Exercises ({exercises.length})
          </h3>
        </div>

        <div className="space-y-3">
          {exercises.map((workoutExercise, index) => (
            <motion.div
              key={workoutExercise.exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <ExerciseCard workoutExercise={workoutExercise} index={index} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

interface ExerciseCardProps {
  workoutExercise: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'][number]
  index: number
}

function ExerciseCard({ workoutExercise, index }: ExerciseCardProps) {
  const { exercise, sets, aiMeta } = workoutExercise

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Exercise Number */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            {index + 1}
          </div>

          {/* Exercise Content */}
          <div className="flex-1 space-y-3">
            {/* Exercise Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-lg">{exercise.name}</h4>
                {exercise.description && (
                  <p className="text-sm text-muted-foreground">
                    {exercise.description}
                  </p>
                )}
              </div>
              {exercise.videoUrl && <VideoPreview url={exercise.videoUrl} />}
            </div>

            {/* Sets and Reps */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">
                {sets.length} sets × {sets[0]?.reps || 0} reps
              </span>
              {sets[0]?.rpe && (
                <span className="text-muted-foreground">RPE {sets[0].rpe}</span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {exercise.equipment && (
                <Badge variant="secondary" className="capitalize">
                  {translateEquipment(exercise.equipment)}
                </Badge>
              )}
              {exercise.muscleGroups.map((group, idx) => (
                <Badge
                  key={`${group.groupSlug}-${idx}`}
                  variant="muscle"
                  className="capitalize"
                >
                  {group.alias}
                </Badge>
              ))}
            </div>

            {/* AI Explanation */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {aiMeta.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
