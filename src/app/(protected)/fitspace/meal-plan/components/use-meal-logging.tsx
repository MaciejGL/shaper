import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBatchLogMealFoodMutation,
  useCompleteMealMutation,
  useGetActiveMealPlanQuery,
  useGetDefaultMealPlanQuery,
  useRemoveMealLogMutation,
  useUncompleteMealMutation,
} from '@/generated/graphql-client'

interface FoodQuantity {
  id: string
  name: string
  originalQuantity: number
  loggedQuantity: number
  unit: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export function useMealLogging() {
  const queryClient = useQueryClient()

  const { mutate: batchLogMealFood, isPending: isBatchLoggingFood } =
    useBatchLogMealFoodMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: useGetActiveMealPlanQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useGetDefaultMealPlanQuery.getKey(),
        })
      },
      onError: (error) => {
        toast.error('Something went wrong while logging meal foods')
        console.error('Error batch logging meal foods:', error)
      },
    })

  const { mutateAsync: completeMeal, isPending: isCompletingMeal } =
    useCompleteMealMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: useGetActiveMealPlanQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useGetDefaultMealPlanQuery.getKey(),
        })
      },
      onError: (error) => {
        toast.error('Something went wrong while completing meal')
        console.error('Error completing meal:', error)
      },
    })

  const { mutateAsync: uncompleteMeal, isPending: isUncompletingMeal } =
    useUncompleteMealMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: useGetActiveMealPlanQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useGetDefaultMealPlanQuery.getKey(),
        })
      },
      onError: (error) => {
        toast.error('Something went wrong while uncompleting meal')
        console.error('Error uncompleting meal:', error)
      },
    })

  const { mutate: removeLog, isPending: isRemovingLogItem } =
    useRemoveMealLogMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: useGetActiveMealPlanQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useGetDefaultMealPlanQuery.getKey(),
        })
      },
    })

  const handleBatchLogMeal = async (
    mealId: string,
    foodQuantities: FoodQuantity[],
  ) => {
    const loggedItems = foodQuantities.filter((food) => food.loggedQuantity > 0)

    if (loggedItems.length === 0) {
      return
    }

    // Prepare foods for batch logging
    const foods = loggedItems.map((food) => {
      const ratio = food.loggedQuantity / food.originalQuantity
      const adjustedCalories = food.totalCalories * ratio
      const adjustedProtein = food.totalProtein * ratio
      const adjustedCarbs = food.totalCarbs * ratio
      const adjustedFat = food.totalFat * ratio

      return {
        name: food.name,
        quantity: food.loggedQuantity,
        unit: food.unit,
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
      }
    })

    // Use batch mutation for single API call
    return await batchLogMealFood({
      input: {
        mealId,
        foods,
      },
    })
  }

  const handleCompleteMeal = (mealId: string) => {
    return completeMeal({ mealId })
  }

  const handleUncompleteMeal = (mealId: string) => {
    return uncompleteMeal({ mealId })
  }

  const handleRemoveLogItem = async (foodId: string) => {
    await removeLog({ foodId })
  }

  return {
    handleBatchLogMeal,
    handleCompleteMeal,
    handleUncompleteMeal,
    handleRemoveLogItem,
    isRemovingLogItem,
    // Export specific loading states for better UX
    isCompletingMeal,
    isUncompletingMeal,
    isBatchLoggingFood,
    isLoading:
      isBatchLoggingFood ||
      isCompletingMeal ||
      isUncompletingMeal ||
      isRemovingLogItem,
  }
}
