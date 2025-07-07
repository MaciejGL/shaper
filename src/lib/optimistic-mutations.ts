import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import type {
  GQLAddExerciseToDayInput,
  GQLAddSetExerciseFormInput,
  GQLGetExerciseFormDataQuery,
  GQLGetTemplateTrainingPlanByIdQuery,
  GQLUpdateExerciseFormInput,
  GQLUpdateExerciseSetInput,
} from '@/generated/graphql-client'

/**
 * Unified optimistic mutation system using React Query cache
 * Eliminates the need for local state management in forms
 */

// Type definitions for our optimistic update system
export interface OptimisticUpdateConfig<TData, TMutationData, TVariables> {
  queryKey: unknown[]
  mutationFn: (variables: TVariables) => Promise<TMutationData>
  updateFn: (oldData: TData, variables: TVariables, tempId?: string) => TData
  rollbackFn?: (oldData: TData, error: Error, variables: TVariables) => TData
  onSuccess?: (
    data: TMutationData,
    variables: TVariables,
    tempId?: string,
  ) => void
  onError?: (error: Error, variables: TVariables) => void
}

/**
 * Hook for managing optimistic updates with React Query cache
 */
export function useOptimisticMutation<TData, TMutationData, TVariables>({
  queryKey,
  mutationFn,
  updateFn,
  rollbackFn,
  onSuccess,
  onError,
}: OptimisticUpdateConfig<TData, TMutationData, TVariables>) {
  const queryClient = useQueryClient()

  const optimisticMutate = useCallback(
    async (variables: TVariables, tempId?: string) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey })

      // Get current cache data as fallback
      const previousData = queryClient.getQueryData<TData>(queryKey)

      if (!previousData) {
        console.warn('[OptimisticMutation]: No existing data in cache')
        return
      }

      try {
        // Optimistically update the cache
        const optimisticData = updateFn(previousData, variables, tempId)
        queryClient.setQueryData(queryKey, optimisticData)

        // Execute the mutation
        const result = await mutationFn(variables)

        // Handle success
        onSuccess?.(result, variables, tempId)

        return result
      } catch (error) {
        console.error('[OptimisticMutation]: Mutation failed', error)

        // Revert optimistic update on error
        if (rollbackFn && previousData) {
          const rolledBackData = rollbackFn(
            previousData,
            error as Error,
            variables,
          )
          queryClient.setQueryData(queryKey, rolledBackData)
        } else {
          // Default rollback to previous data
          queryClient.setQueryData(queryKey, previousData)
        }

        onError?.(error as Error, variables)
        throw error
      }
    },
    [
      queryClient,
      queryKey,
      mutationFn,
      updateFn,
      rollbackFn,
      onSuccess,
      onError,
    ],
  )

  return { optimisticMutate }
}

/**
 * Specific optimistic update functions for training plan entities
 */

// Exercise form data updates
export function createExerciseFormOptimisticUpdate() {
  return {
    updateExercise: (
      oldData: GQLGetExerciseFormDataQuery,
      variables: { input: GQLUpdateExerciseFormInput },
    ): GQLGetExerciseFormDataQuery => {
      if (!oldData?.exercise) return oldData

      return {
        ...oldData,
        exercise: {
          ...oldData.exercise,
          name: variables.input.name || oldData.exercise.name,
          // Use provided values directly - allows undefined/null to clear fields
          type: variables.input.type,
          instructions: variables.input.instructions,
          additionalInstructions: variables.input.additionalInstructions,
          restSeconds: variables.input.restSeconds,
          warmupSets: variables.input.warmupSets,
          tempo: variables.input.tempo,
          sets: oldData.exercise.sets,
        },
      }
    },

    addSet: (
      oldData: GQLGetExerciseFormDataQuery,
      variables: { input: GQLAddSetExerciseFormInput },
      tempId?: string,
    ): GQLGetExerciseFormDataQuery => {
      if (!oldData?.exercise) return oldData

      const lastSet = oldData.exercise.sets[oldData.exercise.sets.length - 1]
      const newSet = {
        id: tempId || generateTempId('set'),
        order: oldData.exercise.sets.length + 1,
        minReps: variables.input.set.minReps || lastSet?.minReps || null,
        maxReps: variables.input.set.maxReps || lastSet?.maxReps || null,
        weight: variables.input.set.weight || lastSet?.weight || null,
        rpe: variables.input.set.rpe || lastSet?.rpe || null,
      }

      return {
        ...oldData,
        exercise: {
          ...oldData.exercise,
          sets: [...oldData.exercise.sets, newSet],
        },
      }
    },

    removeSet: (
      oldData: GQLGetExerciseFormDataQuery,
      variables: { setId: string },
    ): GQLGetExerciseFormDataQuery => {
      if (!oldData?.exercise) return oldData

      return {
        ...oldData,
        exercise: {
          ...oldData.exercise,
          sets: oldData.exercise.sets.filter(
            (set) => set.id !== variables.setId,
          ),
        },
      }
    },

    updateSet: (
      oldData: GQLGetExerciseFormDataQuery,
      variables: { input: GQLUpdateExerciseSetInput },
    ): GQLGetExerciseFormDataQuery => {
      if (!oldData?.exercise) return oldData

      return {
        ...oldData,
        exercise: {
          ...oldData.exercise,
          sets: oldData.exercise.sets.map((set) =>
            set.id === variables.input.id
              ? {
                  ...set,
                  // Use provided values directly - allows undefined/null to clear fields
                  minReps: variables.input.minReps,
                  maxReps: variables.input.maxReps,
                  weight: variables.input.weight,
                  rpe: variables.input.rpe,
                  order: variables.input.order,
                }
              : set,
          ),
        },
      }
    },

    replaceTemporarySet: (
      oldData: GQLGetExerciseFormDataQuery,
      tempId: string,
      realId: string,
    ): GQLGetExerciseFormDataQuery => {
      if (!oldData?.exercise) return oldData

      return {
        ...oldData,
        exercise: {
          ...oldData.exercise,
          sets: oldData.exercise.sets.map((set) =>
            set.id === tempId ? { ...set, id: realId } : set,
          ),
        },
      }
    },
  }
}

// Training plan updates
export function createTrainingPlanOptimisticUpdate() {
  return {
    updateExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: {
        weekIndex: number
        dayIndex: number
        exerciseIndex: number
        exercise: Partial<
          GQLGetTemplateTrainingPlanByIdQuery['getTrainingPlanById']['weeks'][number]['days'][number]['exercises'][number]
        >
      },
    ): GQLGetTemplateTrainingPlanByIdQuery => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      const newWeeks = oldData.getTrainingPlanById.weeks.map((week, wIdx) => {
        if (wIdx !== variables.weekIndex) return week

        return {
          ...week,
          days: week.days.map((day, dIdx) => {
            if (dIdx !== variables.dayIndex) return day

            return {
              ...day,
              exercises: day.exercises.map((exercise, eIdx) => {
                if (eIdx !== variables.exerciseIndex) return exercise

                return {
                  ...exercise,
                  ...variables.exercise,
                }
              }),
            }
          }),
        }
      })

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    addExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: {
        weekIndex: number
        dayIndex: number
        exercise: Omit<GQLAddExerciseToDayInput, 'dayId' | 'order'>
        atIndex?: number
      },
      tempId: string,
    ): GQLGetTemplateTrainingPlanByIdQuery => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      const newWeeks = oldData.getTrainingPlanById.weeks.map((week, wIdx) => {
        if (wIdx !== variables.weekIndex) return week

        return {
          ...week,
          days: week.days.map((day, dIdx) => {
            if (dIdx !== variables.dayIndex) return day

            const newExercise = {
              id: tempId,
              name: variables.exercise.name || '',
              type: variables.exercise.type || null,
              instructions: variables.exercise.instructions || null,
              additionalInstructions:
                variables.exercise.additionalInstructions || null,
              restSeconds: variables.exercise.restSeconds || null,
              warmupSets: variables.exercise.warmupSets || null,
              tempo: variables.exercise.tempo || null,
              sets: [
                {
                  id: tempId,
                  order: 1,
                  minReps: null,
                  maxReps: null,
                  weight: null,
                  rpe: null,
                },
              ],
              order:
                variables.atIndex !== undefined
                  ? variables.atIndex + 1
                  : day.exercises.length + 1,
            }

            const newExercises = [...day.exercises]
            if (variables.atIndex !== undefined) {
              newExercises.splice(variables.atIndex, 0, newExercise)
            } else {
              newExercises.push(newExercise)
            }

            return {
              ...day,
              exercises: newExercises,
            }
          }),
        }
      })

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },

    removeExercise: (
      oldData: GQLGetTemplateTrainingPlanByIdQuery,
      variables: { weekIndex: number; dayIndex: number; exerciseIndex: number },
    ): GQLGetTemplateTrainingPlanByIdQuery => {
      if (!oldData?.getTrainingPlanById?.weeks) return oldData

      const newWeeks = oldData.getTrainingPlanById.weeks.map((week, wIdx) => {
        if (wIdx !== variables.weekIndex) return week

        return {
          ...week,
          days: week.days.map((day, dIdx) => {
            if (dIdx !== variables.dayIndex) return day

            const newExercises = day.exercises.filter(
              (_, eIdx) => eIdx !== variables.exerciseIndex,
            )

            // Update order for remaining exercises
            const reorderedExercises = newExercises.map((exercise, idx) => ({
              ...exercise,
              order: idx + 1,
            }))

            return {
              ...day,
              exercises: reorderedExercises,
            }
          }),
        }
      })

      return {
        ...oldData,
        getTrainingPlanById: {
          ...oldData.getTrainingPlanById,
          weeks: newWeeks,
        },
      }
    },
  }
}

/**
 * Helper to generate temporary IDs
 */
export function generateTempId(prefix = 'temp') {
  return `${prefix}-${Date.now()}-${Math.random()}`
}

/**
 * Helper to check if an ID is temporary
 */
export function isTemporaryId(id: string): boolean {
  return (
    id.startsWith('temp-') ||
    id.startsWith('set-') ||
    id.startsWith('exercise-')
  )
}
