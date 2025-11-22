import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

import { useIsFirstRender } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceRemoveSetMutation,
  GQLTrainingView,
  useFitspaceAddSetMutation,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
  useFitspaceRemoveSetMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

import { createOptimisticRemoveSetUpdate } from '../optimistic-updates'

import { ExerciseSet } from './exercise-set'
import { ExerciseSetsProps } from './types'

export function ExerciseSets({
  exercise,
  previousLogs,
  onSetCompleted,
  onSetUncompleted,
  onSetsLogsChange,
}: ExerciseSetsProps) {
  const isFirstRender = useIsFirstRender()
  const { trainingId } = useParams<{ trainingId: string }>()
  const [dayId] = useQueryState('day')
  const queryClient = useQueryClient()
  const { preferences } = useUserPreferences()
  const invalidateQuery = useInvalidateQuery()
  const [isRemovingSet, setIsRemovingSet] = useState(false)
  const isAdvancedView = preferences.trainingView === GQLTrainingView.Advanced
  // Initialize state with current log values for each set
  const [setsLogs, setSetsLogs] = useState<
    Record<string, { weight: string; reps: string }>
  >(() => {
    const initialState: Record<string, { weight: string; reps: string }> = {}
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    exerciseSets.forEach((set) => {
      const previousWeightLog = previousLogs?.find(
        (log) => log.order === set.order,
      )?.log?.weight
      const previousRepsLog = previousLogs?.find(
        (log) => log.order === set.order,
      )?.log?.reps

      initialState[set.id] = {
        weight:
          set.log?.weight?.toString() ??
          (isAdvancedView ? (previousWeightLog?.toString() ?? '') : ''),
        reps:
          set.log?.reps?.toString() ??
          (isAdvancedView ? (previousRepsLog?.toString() ?? '') : ''),
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
        const previousWeightLog = previousLogs?.find(
          (log) => log.order === set.order,
        )?.log?.weight
        const previousRepsLog = previousLogs?.find(
          (log) => log.order === set.order,
        )?.log?.reps
        const newLogWeight =
          set.log?.weight?.toString() ??
          (isAdvancedView ? (previousWeightLog?.toString() ?? '') : '')
        const newLogReps =
          set.log?.reps?.toString() ??
          (isAdvancedView ? (previousRepsLog?.toString() ?? '') : '')

        if (!currentState) {
          // New set - add it with last set's actual logged values as defaults
          const currentIndex = exerciseSets.findIndex((s) => s.id === set.id)
          const lastSetId =
            currentIndex > 0 ? exerciseSets[currentIndex - 1].id : null
          const lastSetValues = lastSetId ? prev[lastSetId] : null

          updated[set.id] = {
            weight: lastSetValues?.weight ?? newLogWeight,
            reps: lastSetValues?.reps ?? newLogReps,
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
  }, [
    exercise.substitutedBy?.sets,
    exercise.sets,
    previousLogs,
    isAdvancedView,
  ])

  // Notify parent when setsLogs changes
  useEffect(() => {
    onSetsLogsChange?.(setsLogs)
  }, [setsLogs, onSetsLogsChange])

  // ✅ Add Set: Get real ID from server, mark exercise as incomplete
  const { mutateAsync: addSet, isPending: isAddingSet } =
    useFitspaceAddSetMutation({
      onSuccess: (data) => {
        queryClient.setQueryData(
          useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
          (old: GQLFitspaceGetWorkoutDayQuery) => {
            if (!old?.getWorkoutDay?.day || !data?.addSet) return old

            const newData = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutDayQuery>
            if (!newData.getWorkoutDay?.day) return newData

            newData.getWorkoutDay.day.exercises.forEach((exerciseItem) => {
              const targetExerciseId = exercise.substitutedBy?.id || exercise.id
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

            return newData
          },
        )

        // Also invalidate navigation to update day progress
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
        })
      },
    })

  // ✅ Remove Set: Optimistic update + check if all remaining sets completed
  const { optimisticMutate: removeSet } = useOptimisticMutation<
    GQLFitspaceGetWorkoutDayQuery,
    GQLFitspaceRemoveSetMutation,
    { setId: string }
  >({
    queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId: dayId ?? '' }),
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

  const handleRemoveLastSet = async () => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    // Find the last extra set
    const lastExtraSet = [...exerciseSets].reverse().find((set) => set.isExtra)

    if (lastExtraSet) {
      setIsRemovingSet(true)
      try {
        await removeSet({ setId: lastExtraSet.id })
      } finally {
        setIsRemovingSet(false)
      }
    }
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
    onSetCompleted(setId, skipTimer)
  }

  const handleSetUncompleted = () => {
    onSetUncompleted()
  }

  const getPreviousSetValue = (order: number, type: 'weight' | 'reps') => {
    if (!previousLogs) return null
    const previousSet = previousLogs.find((log) => log.order === order)
    return previousSet ? previousSet.log?.[type] : null
  }

  const hasExtraSets =
    (exercise.substitutedBy?.sets?.some((set) => set.isExtra) ||
      exercise.sets.some((set) => set.isExtra)) &&
    exercise.sets.length > 1
  return (
    <div className="flex flex-col w-full bg-card shadow-xs overflow-hidden mb-12">
      {/* Table Header */}
      <div className="grid grid-cols-[1.5rem_minmax(3rem,1fr)_minmax(5rem,1fr)_minmax(5rem,1fr)_2rem] gap-2 px-3 items-center text-xs font-medium text-muted-foreground py-2 border-b border-border/50">
        <div className="text-center">Set</div>
        <div className="text-center">Previous</div>
        <div className="text-center">Reps</div>
        <div className="text-center uppercase">{preferences.weightUnit}</div>
        <div />
      </div>

      {/* Sets Rows */}
      <div>
        {(exercise.substitutedBy?.sets || exercise.sets).map((set) => {
          const previousWeightLog = getPreviousSetValue(set.order, 'weight')
          const previousRepsLog = getPreviousSetValue(set.order, 'reps')

          return (
            <AnimatePresence key={set.id} mode="wait" initial={!isFirstRender}>
              <ExerciseSet
                key={set.id}
                set={set}
                previousSetWeightLog={previousWeightLog}
                previousSetRepsLog={previousRepsLog}
                reps={setsLogs[set.id]?.reps ?? ''}
                weight={setsLogs[set.id]?.weight ?? ''}
                onRepsChange={(reps) => handleRepsChange(reps, set.id)}
                onWeightChange={(weight) => handleWeightChange(weight, set.id)}
                onSetCompleted={(skipTimer) =>
                  handleSetCompleted(set.id, skipTimer)
                }
                onSetUncompleted={handleSetUncompleted}
              />
            </AnimatePresence>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-border/50">
        {hasExtraSets && (
          <Button
            variant="ghost"
            size="lg"
            className=" flex-1 text-muted-foreground hover:text-foreground rounded-none border-r border-border"
            loading={isRemovingSet}
            disabled={isRemovingSet}
            onClick={handleRemoveLastSet}
            iconStart={<PlusIcon className="rotate-45 size-3" />}
          >
            Remove Set
          </Button>
        )}
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 text-muted-foreground hover:text-foreground  rounded-none"
          loading={isAddingSet}
          onClick={handleAddSet}
          iconStart={<PlusIcon className="size-3" />}
        >
          Add Set
        </Button>
      </div>
    </div>
  )
}
