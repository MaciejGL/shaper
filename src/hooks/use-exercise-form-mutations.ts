import { useQueryClient } from '@tanstack/react-query'

import {
  type GQLAddSetExerciseFormMutation,
  type GQLAddSetExerciseFormMutationVariables,
  type GQLGetExerciseFormDataQuery,
  useAddSetExerciseFormMutation,
  useGetExerciseFormDataQuery,
  useRemoveSetExerciseFormMutation,
  useUpdateExerciseFormMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import {
  createExerciseFormOptimisticUpdate,
  generateTempId,
  useOptimisticMutation,
} from '@/lib/optimistic-mutations'

/**
 * Unified exercise form mutations using optimistic updates with React Query cache
 * Eliminates local state management and sync issues
 */
export function useExerciseFormMutations(exerciseId: string) {
  const queryClient = useQueryClient()
  const exerciseQueryKey = useGetExerciseFormDataQuery.getKey({ exerciseId })

  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById', 'GetExerciseFormData'],
    delay: 1000,
  })

  const optimisticUpdaters = createExerciseFormOptimisticUpdate()

  // Exercise update mutation
  const { mutateAsync: updateExerciseFormMutation } =
    useUpdateExerciseFormMutation()
  const { optimisticMutate: updateExercise } = useOptimisticMutation({
    queryKey: exerciseQueryKey,
    mutationFn: updateExerciseFormMutation,
    updateFn: optimisticUpdaters.updateExercise,
    onSuccess: () => debouncedInvalidateQueries(),
    onError: (error) =>
      console.error('[UpdateExercise]: Failed to update exercise', {
        exerciseId,
        error,
      }),
  })

  // Add set mutation
  const { mutateAsync: addSetExerciseFormMutation } =
    useAddSetExerciseFormMutation()
  const { optimisticMutate: addSetOptimistic } = useOptimisticMutation({
    queryKey: exerciseQueryKey,
    mutationFn: addSetExerciseFormMutation,
    updateFn: optimisticUpdaters.addSet,
    onSuccess: (
      data: GQLAddSetExerciseFormMutation,
      variables: GQLAddSetExerciseFormMutationVariables,
      tempId?: string,
    ) => {
      // Replace temporary ID with real ID from server
      if (tempId) {
        queryClient.setQueryData<GQLGetExerciseFormDataQuery>(
          exerciseQueryKey,
          (oldData: GQLGetExerciseFormDataQuery | undefined) => {
            if (!oldData) return oldData
            return optimisticUpdaters.replaceTemporarySet(
              oldData,
              tempId,
              data.addSetExerciseForm.id,
            )
          },
        )
      }
      debouncedInvalidateQueries()
    },
    onError: (error) =>
      console.error('[AddSet]: Failed to add set', { exerciseId, error }),
  })

  // Remove set mutation
  const { mutateAsync: removeSetExerciseFormMutation } =
    useRemoveSetExerciseFormMutation()
  const { optimisticMutate: removeSet } = useOptimisticMutation({
    queryKey: exerciseQueryKey,
    mutationFn: removeSetExerciseFormMutation,
    updateFn: optimisticUpdaters.removeSet,
    onSuccess: () => debouncedInvalidateQueries(),
    onError: (error) =>
      console.error('[RemoveSet]: Failed to remove set', { exerciseId, error }),
  })

  // Wrapper functions for easier use
  const addSet = async (setData: {
    minReps?: number
    maxReps?: number
    weight?: number
    rpe?: number
  }) => {
    const tempId = generateTempId('set')
    return addSetOptimistic(
      {
        input: {
          exerciseId,
          set: setData,
        },
      },
      tempId,
    )
  }

  return {
    updateExercise,
    addSet,
    removeSet,
  }
}
