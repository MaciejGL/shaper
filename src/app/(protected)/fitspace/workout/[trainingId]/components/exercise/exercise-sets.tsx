import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, XIcon } from 'lucide-react'
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

  const removeExtraSet = async () => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    // Find the last extra set (highest order among extra sets)
    const extraSets = exerciseSets.filter((set) => set.isExtra)
    const lastExtraSet = extraSets.reduce(
      (latest, current) => (current.order > latest.order ? current : latest),
      extraSets[0],
    )

    if (lastExtraSet) {
      await removeSet({
        setId: lastExtraSet.id,
      })
    }
  }

  const hasExtraSets = (exercise.substitutedBy?.sets || exercise.sets).some(
    (set) => set.isExtra,
  )

  // Helper function to get previous set's logged value
  const getPreviousSetValue = (
    currentSetOrder: number,
    valueType: 'weight' | 'reps',
  ): number | null => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets

    // Sort sets by order and look through previous sets (order < currentSetOrder)
    const previousSets = exerciseSets
      .filter((set) => set.order < currentSetOrder)
      .sort((a, b) => b.order - a.order) // Sort in descending order (most recent first)

    for (const previousSet of previousSets) {
      // First check if there's a logged value in current session
      const currentSessionValue = setsLogs[previousSet.id]?.[valueType]
      if (currentSessionValue && currentSessionValue !== '') {
        return parseFloat(currentSessionValue)
      }

      // Then check if there's a logged value from previous workout
      const loggedValue = previousSet.log?.[valueType]
      if (loggedValue) {
        return loggedValue
      }
    }

    // If no previous set has a value, look at previous workout logs
    if (previousLogs.length > 0) {
      const lastWorkoutLog = previousLogs[previousLogs.length - 1]
      const correspondingSet = lastWorkoutLog.sets.find(
        (s) => s.order === currentSetOrder,
      )
      if (correspondingSet?.log?.[valueType]) {
        return correspondingSet.log[valueType]
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
    <div className="flex flex-col rounded-[0.45rem]">
      <div className="flex items-center gap-1">
        <div
          className={cn(sharedLayoutStyles, 'text-[0.625rem] py-2 font-medium')}
        >
          <div className="min-w-2.5">SET</div>
          <div className="text-center">PREVIOUS</div>
          <div className="text-center">REPS</div>
          <div className="text-center uppercase">{preferences.weightUnit}</div>
          <div className="text-center"></div>
        </div>

        {hasExtraSets && <div className="w-8 shrink-0" />}
      </div>

      <div className="flex flex-col gap-0">
        {(exercise.substitutedBy?.sets || exercise.sets).map((set) => {
          const previousWeightLog = getPreviousSetValue(set.order, 'weight')
          const previousRepsLog = getPreviousSetValue(set.order, 'reps')

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
            />
          )
        })}

        <div
          className={cn(
            'grid grid-cols-1 items-center justify-items-center gap-2 my-2',
            hasExtraSets && 'grid-cols-2',
          )}
        >
          {hasExtraSets && (
            <Button
              variant="ghost"
              size="xs"
              className="w-max"
              iconStart={<XIcon />}
              onClick={removeExtraSet}
            >
              Remove last set
            </Button>
          )}
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
