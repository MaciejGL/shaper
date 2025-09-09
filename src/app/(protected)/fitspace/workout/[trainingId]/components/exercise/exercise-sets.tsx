import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useIsFirstRender } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutQuery,
  GQLFitspaceRemoveSetMutation,
  GQLTrainingView,
  useFitspaceAddSetMutation,
  useFitspaceGetWorkoutQuery,
  useFitspaceRemoveSetMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { cn } from '@/lib/utils'

import { createOptimisticRemoveSetUpdate } from '../optimistic-updates'

import { ExerciseSet } from './exercise-set'
import {
  sharedLayoutAdvancedStyles,
  sharedLayoutSimpleStyles,
} from './shared-styles'
import { ExerciseSetsProps } from './types'

export function ExerciseSets({ exercise, previousLogs }: ExerciseSetsProps) {
  const isFirstRender = useIsFirstRender()
  const { trainingId } = useParams<{ trainingId: string }>()
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

  // Timer state management - only one timer can be active at a time
  const [activeTimerSetId, setActiveTimerSetId] = useState<string | null>(null)

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

  // ✅ Add Set: Get real ID from server, mark exercise as incomplete
  const { mutateAsync: addSet, isPending: isAddingSet } =
    useFitspaceAddSetMutation({
      onSuccess: (data) => {
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          (old: GQLFitspaceGetWorkoutQuery) => {
            if (!old?.getWorkout?.plan || !data?.addSet) return old

            const newWorkout = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutQuery>
            if (!newWorkout.getWorkout?.plan) return newWorkout

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
                    const lastSet = setsToUpdate[setsToUpdate.length - 1]
                    const maxOrder =
                      setsToUpdate.length > 0
                        ? Math.max(...setsToUpdate.map((set) => set.order))
                        : 0

                    // Add new set with real server ID
                    setsToUpdate.push({
                      ...data.addSet,
                      order: maxOrder + 1,
                      isExtra: true,
                      reps: lastSet?.reps || null,
                      minReps: lastSet?.minReps || null,
                      maxReps: lastSet?.maxReps || null,
                      weight: lastSet?.weight || null,
                      rpe: lastSet?.rpe || null,
                      log: null,
                      completedAt: null,
                    })

                    // ✅ Mark exercise as incomplete (new set added)
                    const exerciseToUpdate =
                      exerciseItem.substitutedBy || exerciseItem
                    exerciseToUpdate.completedAt = null
                  }
                })
              })
            })

            return newWorkout
          },
        )
      },
    })

  // ✅ Remove Set: Optimistic update + check if all remaining sets completed
  const { optimisticMutate: removeSet } = useOptimisticMutation<
    GQLFitspaceGetWorkoutQuery,
    GQLFitspaceRemoveSetMutation,
    { setId: string }
  >({
    queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
    mutationFn: useFitspaceRemoveSetMutation().mutateAsync,
    updateFn: (oldData, { setId }) => {
      const updateFn = createOptimisticRemoveSetUpdate(setId)
      return updateFn(oldData)
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

  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced

  return (
    <div className="flex flex-col rounded-[0.45rem] ">
      <div className="flex items-center gap-1">
        <div
          className={cn(
            isAdvancedView
              ? sharedLayoutAdvancedStyles
              : sharedLayoutSimpleStyles,
            'text-[0.625rem] py-2 font-medium',
          )}
        >
          <div className="text-center">SET</div>
          {isAdvancedView && <div className="text-center">PREVIOUS</div>}
          <div className="text-center">REPS</div>
          <div className="text-center uppercase">{preferences.weightUnit}</div>
          <div className="text-center"></div>
        </div>
      </div>

      <div className={cn('flex flex-col gap-0', !isAdvancedView && 'pb-1')}>
        {(exercise.substitutedBy?.sets || exercise.sets).map((set, index) => {
          const previousWeightLog = getPreviousSetValue(set.order, 'weight')
          const previousRepsLog = getPreviousSetValue(set.order, 'reps')

          return (
            <AnimatePresence key={set.id} mode="wait" initial={!isFirstRender}>
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
                isLastSet={index === exercise.sets.length - 1}
                restDuration={exercise.restSeconds}
                isTimerActive={activeTimerSetId === set.id}
                onSetCompleted={(skipTimer) =>
                  handleSetCompleted(set.id, skipTimer)
                }
                onSetUncompleted={handleSetUncompleted}
                onTimerComplete={handleTimerComplete}
              />
            </AnimatePresence>
          )
        })}

        {isAdvancedView && (
          <div
            className={cn(
              'grid grid-cols-1 items-center justify-items-center gap-2 my-2 border-t border-border pt-2',
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
        )}
      </div>
    </div>
  )
}
