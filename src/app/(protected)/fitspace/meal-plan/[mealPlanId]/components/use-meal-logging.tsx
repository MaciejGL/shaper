import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBatchLogMealFoodMutation,
  useCompleteMealMutation,
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
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
      onError: (error) => {
        toast.error('Failed to log meal foods')
        console.error('Error batch logging meal foods:', error)
      },
    })

  const { mutate: completeMeal, isPending: isCompletingMeal } =
    useCompleteMealMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
      onError: (error) => {
        toast.error('Failed to complete meal')
        console.error('Error completing meal:', error)
      },
    })

  const { mutate: uncompleteMeal, isPending: isUncompletingMeal } =
    useUncompleteMealMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
      onError: (error) => {
        toast.error('Failed to uncomplete meal')
        console.error('Error uncompleting meal:', error)
      },
    })

  const { mutate: removeLog, isPending: isRemovingLogItem } =
    useRemoveMealLogMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
    })

  const handleBatchLogMeal = (
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
    batchLogMealFood({
      input: {
        mealId,
        foods,
      },
    })

    // Show success toast for the batch operation
    const totalCalories = loggedItems.reduce((sum, food) => {
      const ratio = food.loggedQuantity / food.originalQuantity
      return sum + food.totalCalories * ratio
    }, 0)

    toast.success(
      `Logged ${loggedItems.length} items (${Math.round(totalCalories)} cal)`,
    )
  }

  const handleCompleteMeal = (mealId: string) => {
    completeMeal({ mealId })
  }

  const handleUncompleteMeal = (mealId: string) => {
    uncompleteMeal({ mealId })
  }

  const handleRemoveLogItem = (foodId: string) => {
    removeLog({ foodId })
  }

  return {
    handleBatchLogMeal,
    handleCompleteMeal,
    handleUncompleteMeal,
    handleRemoveLogItem,
    isRemovingLogItem,
    isLoading:
      isBatchLoggingFood ||
      isCompletingMeal ||
      isUncompletingMeal ||
      isRemovingLogItem,
  }
}
