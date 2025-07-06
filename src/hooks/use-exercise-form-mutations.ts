import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useCallback, useMemo, useRef } from 'react'

import {
  type GQLAddSetExerciseFormMutation,
  type GQLAddSetExerciseFormMutationVariables,
  type GQLGetExerciseFormDataQuery,
  type GQLUpdateExerciseFormInput,
  type GQLUpdateExerciseSetInput,
  useAddSetExerciseFormMutation,
  useGetExerciseFormDataQuery,
  useRemoveSetExerciseFormMutation,
  useUpdateExerciseFormMutation,
  useUpdateExerciseSetMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import {
  createExerciseFormOptimisticUpdate,
  generateTempId,
  useOptimisticMutation,
} from '@/lib/optimistic-mutations'

/**
 * Advanced exercise form mutations with debounced API calls and optimistic updates
 * HOW IT WORKS:
 * 1. User types → Optimistic update applied immediately (instant UI feedback)
 * 2. API call is debounced for 500ms to prevent spam
 * 3. Only the latest values are sent to the server when debounce expires
 * 4. Cache invalidation is selective to preserve user's ongoing typing
 *
 * RACE CONDITION PREVENTION:
 * - Uses refs to track the latest variables for each mutation type
 * - Skips stale API calls if newer data has been typed
 * - Avoids invalidating form data cache to preserve optimistic updates
 */
export function useExerciseFormMutations(exerciseId: string) {
  const queryClient = useQueryClient()
  const exerciseQueryKey = useGetExerciseFormDataQuery.getKey({ exerciseId })

  // Only invalidate the broader training plan, NOT the form data we're optimistically managing
  // This prevents race conditions where refetches overwrite user's typing
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById'],
    delay: 2000,
  })

  const optimisticUpdaters = createExerciseFormOptimisticUpdate()

  // =============================================================================
  // EXERCISE UPDATE (name, instructions, tempo, etc.)
  // =============================================================================

  const { mutateAsync: updateExerciseFormMutation } =
    useUpdateExerciseFormMutation()

  // Track latest variables to prevent stale mutations
  const latestExerciseVariablesRef = useRef<{
    input: GQLUpdateExerciseFormInput
  } | null>(null)

  const debouncedUpdateExerciseMutation = useMemo(
    () =>
      debounce(
        async (variables: { input: GQLUpdateExerciseFormInput }) => {
          // Skip if newer data has been typed (prevents stale API calls)
          if (latestExerciseVariablesRef.current !== variables) {
            return
          }

          try {
            const data = await updateExerciseFormMutation(variables)
            debouncedInvalidateQueries()
            return data
          } catch (error) {
            console.error('[UpdateExercise]: API call failed', {
              exerciseId,
              error,
            })
            // Don't invalidate cache on error - preserve user's optimistic updates
            throw error
          }
        },
        500, // 500ms debounce - good balance between responsiveness and efficiency
      ),
    [updateExerciseFormMutation, exerciseId, debouncedInvalidateQueries],
  )

  const updateExercise = useCallback(
    (variables: { input: GQLUpdateExerciseFormInput }) => {
      // Store latest values for stale check
      latestExerciseVariablesRef.current = variables

      // Apply optimistic update immediately for instant UI feedback
      queryClient.setQueryData<GQLGetExerciseFormDataQuery>(
        exerciseQueryKey,
        (oldData) => {
          if (!oldData) return oldData
          return optimisticUpdaters.updateExercise(oldData, variables)
        },
      )

      // Schedule debounced API call (only latest will execute)
      debouncedUpdateExerciseMutation(variables)
    },
    [
      queryClient,
      exerciseQueryKey,
      optimisticUpdaters,
      debouncedUpdateExerciseMutation,
    ],
  )

  // =============================================================================
  // SET UPDATE (reps, weight, RPE, etc.)
  // =============================================================================

  const { mutateAsync: updateExerciseSetMutation } =
    useUpdateExerciseSetMutation()

  // Track latest set variables separately from exercise variables
  const latestSetVariablesRef = useRef<{
    input: GQLUpdateExerciseSetInput
  } | null>(null)

  const debouncedUpdateSetMutation = useMemo(
    () =>
      debounce(
        async (variables: { input: GQLUpdateExerciseSetInput }) => {
          // Skip if newer data has been typed (prevents stale API calls)
          if (latestSetVariablesRef.current !== variables) {
            return
          }

          try {
            const data = await updateExerciseSetMutation(variables)
            debouncedInvalidateQueries()
            return data
          } catch (error) {
            console.error('[UpdateSet]: API call failed', { exerciseId, error })
            // Don't invalidate cache on error - preserve user's optimistic updates
            throw error
          }
        },
        500, // 500ms debounce - same as exercise updates for consistency
      ),
    [updateExerciseSetMutation, exerciseId, debouncedInvalidateQueries],
  )

  const updateSetOptimistic = useCallback(
    (variables: { input: GQLUpdateExerciseSetInput }) => {
      // Store latest values for stale check
      latestSetVariablesRef.current = variables

      // Apply optimistic update immediately for instant UI feedback
      queryClient.setQueryData<GQLGetExerciseFormDataQuery>(
        exerciseQueryKey,
        (oldData) => {
          if (!oldData) return oldData
          return optimisticUpdaters.updateSet(oldData, variables)
        },
      )

      // Schedule debounced API call (only latest will execute)
      debouncedUpdateSetMutation(variables)
    },
    [
      queryClient,
      exerciseQueryKey,
      optimisticUpdaters,
      debouncedUpdateSetMutation,
    ],
  )

  // =============================================================================
  // SET MANAGEMENT (add/remove sets)
  // =============================================================================

  // Add set mutation (immediate - not debounced since it's user-initiated action)
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
      // Replace temporary ID with real server ID
      if (tempId) {
        queryClient.setQueryData<GQLGetExerciseFormDataQuery>(
          exerciseQueryKey,
          (oldData) => {
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

  // Remove set mutation (immediate - not debounced since it's user-initiated action)
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

  // =============================================================================
  // PUBLIC API - Clean wrapper functions
  // =============================================================================

  const addSet = useCallback(
    async (setData: {
      minReps?: number
      maxReps?: number
      weight?: number
      rpe?: number
    }) => {
      const tempId = generateTempId('set')
      return addSetOptimistic({ input: { exerciseId, set: setData } }, tempId)
    },
    [addSetOptimistic, exerciseId],
  )

  const updateSet = useCallback(
    async (setData: GQLUpdateExerciseSetInput) => {
      return updateSetOptimistic({ input: setData })
    },
    [updateSetOptimistic],
  )

  return {
    updateExercise, // Debounced exercise field updates (name, instructions, etc.)
    addSet, // Immediate set addition
    removeSet, // Immediate set removal
    updateSet, // Debounced set field updates (reps, weight, RPE)
  }
}
