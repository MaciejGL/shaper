import { CheckIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

interface SimpleExerciseListProps {
  onShowSummary: () => void
}

export function SimpleExerciseList({ onShowSummary }: SimpleExerciseListProps) {
  const { activeDay } = useWorkout()
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()

  const { mutateAsync: markExerciseAsCompleted } =
    useFitspaceMarkExerciseAsCompletedMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
        })
      },
    })

  const [completingExercises, setCompletingExercises] = useState<Set<string>>(
    new Set(),
  )

  if (!activeDay) return null

  const completedExercises = activeDay.exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const totalExercises = activeDay.exercises.length
  const progressPercentage =
    totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0
  const allCompleted = completedExercises === totalExercises

  const handleToggleExercise = async (
    exerciseId: string,
    completed: boolean,
  ) => {
    if (completingExercises.has(exerciseId)) return

    setCompletingExercises((prev) => new Set(prev).add(exerciseId))

    try {
      await markExerciseAsCompleted({
        exerciseId,
        completed,
      })
    } catch (error) {
      console.error('Failed to toggle exercise:', error)
    } finally {
      setCompletingExercises((prev) => {
        const next = new Set(prev)
        next.delete(exerciseId)
        return next
      })
    }
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header with Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Workout</h2>
              <Badge variant={allCompleted ? 'primary' : 'outline'}>
                {completedExercises}/{totalExercises} Complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Mark exercises as complete when finished
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <div className="space-y-3">
        {activeDay.exercises.map((exercise, index) => {
          const isCompleted = Boolean(exercise.completedAt)
          const isLoading = completingExercises.has(exercise.id)

          return (
            <Card
              key={exercise.id}
              className={isCompleted ? 'bg-muted/50' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isCompleted}
                    disabled={isLoading}
                    onCheckedChange={(checked) =>
                      handleToggleExercise(exercise.id, Boolean(checked))
                    }
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {exercise.name}
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Exercise Details */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>
                          {exercise.sets.length} set
                          {exercise.sets.length !== 1 ? 's' : ''}
                        </span>
                        {exercise.sets.some((set) => set.reps) && (
                          <span>
                            {exercise.sets.find((set) => set.reps)?.reps ||
                              exercise.sets[0]?.reps}{' '}
                            reps
                          </span>
                        )}
                        {exercise.sets.some((set) => set.weight) && (
                          <span>
                            {exercise.sets.find((set) => set.weight)?.weight ||
                              exercise.sets[0]?.weight}
                            kg
                          </span>
                        )}
                      </div>

                      {exercise.additionalInstructions && (
                        <p className="text-xs">
                          💡 {exercise.additionalInstructions}
                        </p>
                      )}

                      {exercise.instructions && (
                        <p className="text-xs">📝 {exercise.instructions}</p>
                      )}
                    </div>

                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckIcon className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Finish Workout Button */}
      {allCompleted && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckIcon className="h-5 w-5" />
                <span className="font-medium">Workout Complete!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Great job! You've completed all exercises.
              </p>
              <Button onClick={onShowSummary} className="w-full">
                View Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
