import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutQuery,
  useFitspaceAddSetMutation,
  useFitspaceGetWorkoutQuery,
  useFitspaceRemoveSetMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseSet } from './exercise-set'
import { sharedLayoutStyles } from './shared-styles'
import { ExerciseSetsProps } from './types'

export function ExerciseSets({ exercise, previousLogs }: ExerciseSetsProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()
  const { preferences } = useUserPreferences()
  // Initialize state with current log values for each set
  const [setsLogs, setSetsLogs] = useState<
    Record<string, { weight: string; reps: string }>
  >(() => {
    const initialState: Record<string, { weight: string; reps: string }> = {}
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    exerciseSets.forEach((set) => {
      initialState[set.id] = {
        weight: set.log?.weight?.toString() ?? '',
        reps: set.log?.reps?.toString() ?? '',
      }
    })
    return initialState
  })

  // Keep setsLogs in sync with exercise sets (for when new sets are added/removed/updated)
  useEffect(() => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    setSetsLogs((prev) => {
      const updated = { ...prev }

      // Add new sets or update existing sets with new log values
      exerciseSets.forEach((set) => {
        const currentState = updated[set.id]
        const newLogWeight = set.log?.weight?.toString() ?? ''
        const newLogReps = set.log?.reps?.toString() ?? ''

        if (!currentState) {
          // New set - add it
          updated[set.id] = {
            weight: newLogWeight,
            reps: newLogReps,
          }
        } else {
          // Existing set - update only if the log values changed and user hasn't edited
          // If current state is empty but we now have log values, update them
          if (currentState.weight === '' && newLogWeight !== '') {
            updated[set.id] = { ...currentState, weight: newLogWeight }
          }
          if (currentState.reps === '' && newLogReps !== '') {
            updated[set.id] = { ...updated[set.id], reps: newLogReps }
          }
        }
      })

      // Remove any sets that no longer exist
      const currentSetIds = new Set(exerciseSets.map((s) => s.id))
      Object.keys(updated).forEach((setId) => {
        if (!currentSetIds.has(setId)) {
          delete updated[setId]
        }
      })

      return updated
    })
  }, [exercise.substitutedBy?.sets, exercise.sets])

  const { mutateAsync: addSet, isPending: isAddingSet } =
    useFitspaceAddSetMutation({
      onSuccess: (data) => {
        // Manually update the cache with the new set
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          (old: GQLFitspaceGetWorkoutQuery) => {
            if (!old?.getWorkout?.plan || !data?.addSet) return old

            const newWorkout = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutQuery>
            if (!newWorkout.getWorkout?.plan) return newWorkout

            // Find the exercise and add the new set
            newWorkout.getWorkout.plan.weeks.forEach((week) => {
              week.days.forEach((day) => {
                day.exercises.forEach((exerciseItem) => {
                  const targetExerciseId =
                    exercise.substitutedBy?.id || exercise.id
                  const currentExerciseId =
                    exerciseItem.substitutedBy?.id || exerciseItem.id

                  if (currentExerciseId === targetExerciseId) {
                    const setsToUpdate =
                      exerciseItem.substitutedBy?.sets || exerciseItem.sets

                    // Get the last set to inherit target values from
                    const lastSet = setsToUpdate[setsToUpdate.length - 1]

                    // Create a properly structured set with correct order and isExtra = true
                    // Find the maximum existing order to ensure proper sequential ordering
                    const maxOrder =
                      setsToUpdate.length > 0
                        ? Math.max(...setsToUpdate.map((set) => set.order))
                        : 0
                    const newSet = {
                      ...data.addSet,
                      order: maxOrder + 1,
                      isExtra: true,
                      // Inherit target values from the last set
                      reps: lastSet?.reps || null,
                      minReps: lastSet?.minReps || null,
                      maxReps: lastSet?.maxReps || null,
                      weight: lastSet?.weight || null,
                      rpe: lastSet?.rpe || null,
                      // Always null for new sets
                      log: null,
                      completedAt: null,
                    }

                    setsToUpdate.push(newSet)
                  }
                })
              })
            })

            return newWorkout
          },
        )
      },
      onSettled: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const { mutateAsync: removeSet } = useFitspaceRemoveSetMutation({
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
      await queryClient.cancelQueries({ queryKey })

      // Get current data for rollback
      const previousData =
        queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

      // Optimistically update cache to remove the set
      queryClient.setQueryData(queryKey, (old: GQLFitspaceGetWorkoutQuery) => {
        if (!old?.getWorkout?.plan) return old

        const newWorkout = JSON.parse(
          JSON.stringify(old),
        ) as NonNullable<GQLFitspaceGetWorkoutQuery>
        if (!newWorkout.getWorkout?.plan) return newWorkout

        // Find and remove the set from the workout data
        newWorkout.getWorkout.plan.weeks.forEach((week) => {
          week.days.forEach((day) => {
            day.exercises.forEach((exercise) => {
              const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
              const setIndex = setsToUpdate.findIndex(
                (s) => s.id === variables.setId,
              )
              if (setIndex !== -1) {
                setsToUpdate.splice(setIndex, 1)
                // Reorder remaining sets
                setsToUpdate.forEach((remainingSet, index) => {
                  remainingSet.order = index + 1
                })
              }
            })
          })
        })

        return newWorkout
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSuccess: () => {
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })
    },
  })

  const handleAddSet = async () => {
    await addSet({
      exerciseId: exercise.substitutedBy?.id || exercise.id,
    })
  }

  // Helper function to get previous set's logged value
  const getPreviousSetValue = (
    currentSetOrder: number,
    valueType: 'weight' | 'reps',
  ): number | null => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets

    // First, look through previous sets in the current workout (order < currentSetOrder)
    const previousSets = exerciseSets
      .filter((set) => set.order < currentSetOrder)
      .sort((a, b) => b.order - a.order) // Sort in descending order (most recent first)

    for (const previousSet of previousSets) {
      // Check if there's a logged value from a previous set in this workout
      const loggedValue = previousSet.log?.[valueType]
      if (loggedValue !== null && loggedValue !== undefined) {
        return loggedValue
      }

      // Check if user has entered a value for this set in current session
      const currentSessionValue = setsLogs[previousSet.id]?.[valueType]
      if (currentSessionValue && currentSessionValue !== '') {
        return parseFloat(currentSessionValue)
      }
    }

    // If no previous set has a value, look at previous workout logs
    if (previousLogs.length > 0) {
      // Look through previous workouts from most recent to oldest to find logged data
      for (let i = previousLogs.length - 1; i >= 0; i--) {
        const workoutLog = previousLogs[i]
        const correspondingSet = workoutLog.sets.find(
          (s) => s.order === currentSetOrder,
        )
        if (correspondingSet?.log?.[valueType]) {
          return correspondingSet.log[valueType]
        }
      }

      // If no corresponding set at same order found, try to get the last set's value from most recent workout with data
      for (let i = previousLogs.length - 1; i >= 0; i--) {
        const workoutLog = previousLogs[i]
        if (workoutLog.sets.length > 0) {
          const lastSetFromPreviousWorkout =
            workoutLog.sets[workoutLog.sets.length - 1]
          if (lastSetFromPreviousWorkout.log?.[valueType]) {
            return lastSetFromPreviousWorkout.log[valueType]
          }
        }
      }
    }

    return null
  }

  const handleRepsChange = (reps: string, setId: string) => {
    setSetsLogs((prev) => ({
      ...prev,
      [setId]: { ...prev[setId], reps },
    }))
  }

  const handleWeightChange = (weight: string, setId: string) => {
    setSetsLogs((prev) => ({
      ...prev,
      [setId]: { ...prev[setId], weight },
    }))
  }

  return (
    <div className="flex flex-col rounded-[0.45rem] ">
      <div className="flex items-center gap-1">
        <div
          className={cn(sharedLayoutStyles, 'text-[0.625rem] py-2 font-medium')}
        >
          <div className="text-center">SET</div>
          <div className="text-center">PREVIOUS</div>
          <div className="text-center">REPS</div>
          <div className="text-center uppercase">{preferences.weightUnit}</div>
          <div className="text-center"></div>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {(exercise.substitutedBy?.sets || exercise.sets).map((set) => {
          const previousWeightLog = getPreviousSetValue(set.order, 'weight')
          const previousRepsLog = getPreviousSetValue(set.order, 'reps')

          // Debug logging for troublesome exercises
          if (
            process.env.NODE_ENV === 'development' &&
            exercise.name === 'Pec Deck Machine'
          ) {
            console.info('Pec Deck Machine - Debug Info:', {
              exerciseName: exercise.name,
              setOrder: set.order,
              setId: set.id,
              previousWeightLog,
              previousRepsLog,
              previousLogsLength: previousLogs.length,
              previousLogs: previousLogs.map((log) => ({
                name: log.name,
                sets: log.sets.map((s) => ({
                  order: s.order,
                  log: s.log,
                })),
              })),
              currentSetLog: set.log,
              setsLogsForThisSet: setsLogs[set.id],
            })
          }

          return (
            <ExerciseSet
              key={set.id}
              set={set}
              previousSetWeightLog={previousWeightLog}
              previousSetRepsLog={previousRepsLog}
              previousLogs={previousLogs}
              reps={setsLogs[set.id]?.reps ?? ''}
              weight={setsLogs[set.id]?.weight ?? ''}
              onRepsChange={(reps) => handleRepsChange(reps, set.id)}
              onWeightChange={(weight) => handleWeightChange(weight, set.id)}
              onDelete={() => removeSet({ setId: set.id })}
            />
          )
        })}

        <div
          className={cn(
            'grid grid-cols-1 items-center justify-items-center gap-2 my-2',
          )}
        >
          <Button
            variant="ghost"
            size="xs"
            iconStart={<PlusIcon />}
            className="w-max"
            loading={isAddingSet}
            onClick={handleAddSet}
          >
            Add set
          </Button>
        </div>
      </div>
    </div>
  )
}
