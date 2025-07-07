import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'sonner'

import {
  GQLGetMealPlanByIdQuery,
  GQLUpdateMealPlanDetailsInput,
  useGetMealPlanByIdQuery,
  useUpdateMealPlanDetailsMutation,
} from '@/generated/graphql-client'

import { useDebouncedMutation } from './use-debounced-mutation'

/**
 * Custom hook for debounced meal plan details updates
 *
 * This hook provides a debounced mutation for updating meal plan details
 * like title, description, and daily nutrition targets. It prevents
 * excessive API calls when users type rapidly.
 *
 * @param mealPlanId - The ID of the meal plan to update
 * @returns Object with mutate function and loading state
 */
export function useMealPlanDetailsMutation(mealPlanId: string) {
  const queryClient = useQueryClient()
  const queryKey = useGetMealPlanByIdQuery.getKey({ id: mealPlanId })

  const { mutateAsync: updateMealPlanDetails } =
    useUpdateMealPlanDetailsMutation()

  const {
    mutate: debouncedUpdate,
    isPending,
    cancel,
  } = useDebouncedMutation({
    mutationFn: async (
      variables: Omit<GQLUpdateMealPlanDetailsInput, 'id'>,
    ) => {
      return updateMealPlanDetails({
        input: {
          id: mealPlanId,
          ...variables,
        },
      })
    },
    delay: 700, // 700ms debounce for better UX
    onSuccess: () => {
      // Invalidate and refetch meal plan data
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      console.error('Failed to update meal plan details:', error)
      toast.error('Failed to update meal plan details')
    },
  })

  const updateDetails = useCallback(
    (updates: Partial<Omit<GQLUpdateMealPlanDetailsInput, 'id'>>) => {
      // Apply optimistic update to local cache
      queryClient.setQueryData<GQLGetMealPlanByIdQuery>(queryKey, (oldData) => {
        if (!oldData?.getMealPlanById) return oldData

        return {
          ...oldData,
          getMealPlanById: {
            ...oldData.getMealPlanById,
            // Only update fields that are provided and not null
            ...(updates.title !== undefined &&
              updates.title !== null && { title: updates.title }),
            ...(updates.description !== undefined &&
              updates.description !== null && {
                description: updates.description,
              }),
            ...(updates.dailyCalories !== undefined &&
              updates.dailyCalories !== null && {
                dailyCalories: updates.dailyCalories,
              }),
            ...(updates.dailyProtein !== undefined &&
              updates.dailyProtein !== null && {
                dailyProtein: updates.dailyProtein,
              }),
            ...(updates.dailyCarbs !== undefined &&
              updates.dailyCarbs !== null && {
                dailyCarbs: updates.dailyCarbs,
              }),
            ...(updates.dailyFat !== undefined &&
              updates.dailyFat !== null && { dailyFat: updates.dailyFat }),
            ...(updates.isDraft !== undefined &&
              updates.isDraft !== null && { isDraft: updates.isDraft }),
            ...(updates.isPublic !== undefined &&
              updates.isPublic !== null && { isPublic: updates.isPublic }),
          },
        }
      })

      // Trigger debounced API call
      debouncedUpdate(updates)
    },
    [queryClient, queryKey, debouncedUpdate],
  )

  return {
    updateDetails,
    isPending,
    cancel,
  }
}
