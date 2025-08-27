import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Card } from '@/components/ui/card'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { ExerciseMetadata } from './exercise/exercise-metadata'
import { ExerciseSets } from './exercise/exercise-sets'
import { ExerciseProps } from './exercise/types'

export function Exercise({
  exercise,
  exercises,
  onPaginationClick,
}: ExerciseProps) {
  const { getPastLogs } = useWorkout()
  const previousLogs = getPastLogs(exercise)
  const invalidateQuery = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()
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

  const { mutateAsync: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
        })
      },
    })
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(
    Boolean(exercise.completedAt),
  )

  useEffect(() => {
    setIsExerciseCompleted(Boolean(exercise.completedAt))
  }, [exercise.completedAt])

  const handleMarkAsCompleted = async (checked: boolean) => {
    setIsExerciseCompleted(checked)
    try {
      await markExerciseAsCompleted({
        exerciseId: exercise.id,
        completed: checked,
      })
    } catch (error) {
      setIsExerciseCompleted(!checked)
    }
  }

  const handleRemoveExercise = async () => {
    await removeExercise({
      exerciseId: exercise.id,
    })
    const nextExercise = exercises.find((e) => e.order > exercise.order)
    if (nextExercise) {
      onPaginationClick(nextExercise.id, 'next')
    } else {
      const prevExercise = exercises.find((e) => e.order === exercise.order - 1)
      if (prevExercise) {
        onPaginationClick(prevExercise.id, 'prev')
      } else {
        onPaginationClick('summary', 'next')
      }
    }
  }

  return (
    <Card className="p-0 gap-2">
      <div className="px-2 pt-2">
        <ExerciseMetadata
          exercise={exercise}
          handleMarkAsCompleted={handleMarkAsCompleted}
          isCompleted={isExerciseCompleted}
          handleRemoveExercise={handleRemoveExercise}
          isRemoving={isRemoving}
        />
      </div>
      <ExerciseSets exercise={exercise} previousLogs={previousLogs} />
    </Card>
  )
}
