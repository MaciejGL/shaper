'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useState } from 'react'

import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { ExerciseMetadata } from './exercise/exercise-metadata'
import { ExerciseSets } from './exercise/exercise-sets'
import { ExerciseProps } from './exercise/types'
import { createOptimisticExerciseUpdate } from './optimistic-updates'

export function Exercise({
  exercise,
  exercises,
  previousDayLogs,
}: ExerciseProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayId] = useQueryState('day')

  // Timer state management - only one timer can be active at a time
  const [activeTimerSetId, setActiveTimerSetId] = useState<string | null>(null)

  // Track removing state
  const [isRemoving, setIsRemoving] = useState(false)

  // Track current input values for sets
  const [setsLogs, setSetsLogs] = useState<
    Record<string, { weight: string; reps: string }>
  >({})

  const { mutateAsync: markSetAsCompleted } =
    useFitspaceMarkSetAsCompletedMutation()

  const { optimisticMutate: markExerciseAsCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutDayQuery,
      GQLFitspaceMarkExerciseAsCompletedMutation,
      { exerciseId: string; completed: boolean }
    >({
      queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
      mutationFn: useFitspaceMarkExerciseAsCompletedMutation().mutateAsync,
      updateFn: (oldData, { exerciseId, completed }) => {
        // Build previous logs map for fallback values
        const exercisePreviousLogs = previousDayLogs?.find(
          (log) => log.baseId === exercise.baseId,
        )
        const previousLogsMap: Record<
          string,
          { weight?: number | null; reps?: number | null }
        > = {}

        if (exercisePreviousLogs?.sets) {
          exercisePreviousLogs.sets.forEach((setLog) => {
            previousLogsMap[`order-${setLog.order}`] = {
              weight: setLog.log?.weight,
              reps: setLog.log?.reps,
            }
          })
        }

        // Map current sets to use order as key to match with previous logs
        const setsToOrderMap: Record<string, string> = {}
        const currentSets = exercise.substitutedBy?.sets || exercise.sets
        currentSets.forEach((set) => {
          setsToOrderMap[set.id] = `order-${set.order}`
        })

        // Convert setsLogs to use order-based keys for matching
        const orderBasedSetsLogs: Record<
          string,
          { weight: string; reps: string }
        > = {}
        Object.entries(setsLogs).forEach(([setId, values]) => {
          const orderKey = setsToOrderMap[setId]
          if (orderKey) {
            orderBasedSetsLogs[orderKey] = values
          }
        })

        const updateFn = createOptimisticExerciseUpdate(
          exerciseId,
          completed,
          orderBasedSetsLogs,
          previousLogsMap,
        )
        return updateFn(oldData)
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['navigation'] })
        router.refresh()
      },
      onError: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['navigation'] }),
          queryClient.invalidateQueries({
            queryKey: useFitspaceGetWorkoutDayQuery.getKey({
              dayId: dayId ?? '',
            }),
          }),
        ])
        router.refresh()
      },
    })

  const { mutateAsync: removeExerciseMutation } =
    useFitspaceRemoveExerciseFromWorkoutMutation()

  const { optimisticMutate: removeExerciseOptimistic } = useOptimisticMutation<
    GQLFitspaceGetWorkoutDayQuery,
    boolean,
    { exerciseId: string }
  >({
    queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
    mutationFn: async ({ exerciseId }) => {
      const result = await removeExerciseMutation({ exerciseId })
      return result.removeExerciseFromWorkout
    },
    updateFn: (oldData, { exerciseId }) => {
      // Optimistically remove the exercise from the cache
      if (!oldData?.getWorkoutDay?.day) return oldData

      const remainingExercises = oldData.getWorkoutDay.day.exercises.filter(
        (ex) => ex.id !== exerciseId,
      )

      // Day is completed only if all remaining exercises are completed
      const allExercisesCompleted =
        remainingExercises.length > 0 &&
        remainingExercises.every((ex) => ex.completedAt !== null)

      return {
        ...oldData,
        getWorkoutDay: {
          ...oldData.getWorkoutDay,
          day: {
            ...oldData.getWorkoutDay.day,
            exercises: remainingExercises,
            completedAt: allExercisesCompleted
              ? oldData.getWorkoutDay.day.completedAt
              : null,
          },
        },
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['navigation'] })
      router.refresh()
      setIsRemoving(false)
    },
    onError: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['navigation'] }),
        queryClient.invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FitspaceGetQuickWorkoutDay'],
        }),
      ])
      router.refresh()
      setIsRemoving(false)
    },
  })

  const handleMarkAsCompleted = async (checked: boolean) => {
    try {
      // ✅ First: Immediate optimistic update for instant UI feedback
      await markExerciseAsCompletedOptimistic({
        exerciseId: exercise.substitutedBy?.id || exercise.id,
        completed: checked,
      })

      // ✅ Then: Save incomplete sets to database in background (if completing)
      if (checked) {
        const currentSets = exercise.substitutedBy?.sets || exercise.sets
        const incompleteSets = currentSets.filter((set) => !set.completedAt)

        // Complete all incomplete sets in parallel (background - don't await)
        const setCompletionPromises = incompleteSets.map((set) => {
          const currentInputs = setsLogs[set.id]
          const exercisePreviousLogs = previousDayLogs?.find(
            (log) => log.exerciseName === exercise.name,
          )
          const previousSetLog = exercisePreviousLogs?.sets?.find(
            (logSet) => logSet.order === set.order,
          )

          // Get values from current inputs, fallback to previous logs
          const repsValue = currentInputs?.reps
            ? +currentInputs.reps
            : previousSetLog?.log?.reps || null
          const weightValue = currentInputs?.weight
            ? +currentInputs.weight
            : previousSetLog?.log?.weight || null

          // Return the set completion promise
          return markSetAsCompleted({
            setId: set.id,
            completed: true,
            reps: repsValue,
            weight: weightValue,
          })
        })

        // ✅ Only sync cache on error - optimistic updates handle success case
        Promise.all(setCompletionPromises).catch(async (error) => {
          console.error('Failed to save set completions:', error)
          // On error, sync with server to fix inconsistencies
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['navigation'] }),
            queryClient.invalidateQueries({
              queryKey: useFitspaceGetWorkoutDayQuery.getKey({
                dayId: dayId ?? '',
              }),
            }),
          ])
          router.refresh()
        })
      }
    } catch (error) {
      console.error('Failed to toggle exercise completion:', error)
      // Error handling is done in useOptimisticMutation
    }
  }

  const handleRemoveExercise = async () => {
    setIsRemoving(true)
    try {
      await removeExerciseOptimistic({
        exerciseId: exercise.id,
      })
    } catch (error) {
      console.error('Failed to remove exercise:', error)
      setIsRemoving(false)
      // Error handling is done in useOptimisticMutation
    }
  }

  // Timer management functions
  const handleSetCompleted = (setId: string, skipTimer: boolean = false) => {
    if (!skipTimer) {
      setActiveTimerSetId(setId)
    }
  }

  const handleTimerComplete = () => {
    setActiveTimerSetId(null)
  }

  const handleSetUncompleted = () => {
    setActiveTimerSetId(null)
  }

  // Get the completion state from the exercise data (cache will update optimistically)
  const currentExercise = exercise.substitutedBy || exercise
  const isExerciseCompleted = Boolean(currentExercise.completedAt)

  const exercisePreviousLogs = previousDayLogs?.find(
    (log) => log.baseId === exercise.baseId,
  )

  const handleSetsLogsChange = (
    newSetsLogs: Record<string, { weight: string; reps: string }>,
  ) => {
    setSetsLogs(newSetsLogs)
  }

  return (
    <div className="bg-gradient-to-b from-white via-white to-background dark:from-background-subtle dark:via-background-subtle dark:to-background pb-12">
      <div id={exercise.id}>
        <ExerciseMetadata
          exercise={exercise}
          exercises={exercises}
          handleMarkAsCompleted={handleMarkAsCompleted}
          isCompleted={isExerciseCompleted}
          handleRemoveExercise={handleRemoveExercise}
          isRemoving={isRemoving}
          activeTimerSetId={activeTimerSetId}
          onTimerComplete={handleTimerComplete}
        />
      </div>
      <div
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: '1px 800px',
        }}
      >
        <ExerciseSets
          exercise={exercise}
          previousLogs={exercisePreviousLogs?.sets}
          onSetCompleted={handleSetCompleted}
          onSetUncompleted={handleSetUncompleted}
          onSetsLogsChange={handleSetsLogsChange}
        />
      </div>
    </div>
  )
}
