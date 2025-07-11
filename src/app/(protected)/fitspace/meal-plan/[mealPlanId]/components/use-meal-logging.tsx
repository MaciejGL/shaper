import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  useBatchLogMealFoodMutation,
  useCompleteMealMutation,
  useLogMealFoodMutation,
  useUncompleteMealMutation,
  useUpdateMealFoodLogMutation,
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

  const { mutate: logMealFood, isPending: isLoggingFood } =
    useLogMealFoodMutation({
      onSuccess: () => {
        // Invalidate all meal plan related queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
      onError: (error) => {
        toast.error('Failed to log meal food')
        console.error('Error logging meal food:', error)
      },
    })

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

  const { mutate: updateMealFoodLog, isPending: isUpdatingLog } =
    useUpdateMealFoodLogMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['FitspaceGetMealPlan'] })
        queryClient.invalidateQueries({
          queryKey: ['FitspaceMealPlansOverview'],
        })
      },
      onError: (error) => {
        toast.error('Failed to update meal log')
        console.error('Error updating meal log:', error)
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

  const handleLogFood = (
    mealId: string,
    foodId: string,
    quantity: number,
    foodData: {
      name: string
      unit: string
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
    },
  ) => {
    logMealFood({
      input: {
        mealId,
        name: foodData.name,
        quantity,
        unit: foodData.unit,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
      },
    })
  }

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

  const handleRemoveLog = (logItemId: string) => {
    // Set quantity to 0 to effectively remove the log
    updateMealFoodLog({
      input: {
        id: logItemId,
        quantity: 0,
      },
    })
  }

  const handleUpdateQuantity = (logItemId: string, quantity: number) => {
    updateMealFoodLog({
      input: {
        id: logItemId,
        quantity,
      },
    })
  }

  const handleCompleteMeal = (mealId: string) => {
    completeMeal({ mealId })
  }

  const handleUncompleteMeal = (mealId: string) => {
    uncompleteMeal({ mealId })
  }

  return {
    handleLogFood,
    handleBatchLogMeal,
    handleRemoveLog,
    handleUpdateQuantity,
    handleCompleteMeal,
    handleUncompleteMeal,
    isLoading:
      isLoggingFood ||
      isBatchLoggingFood ||
      isUpdatingLog ||
      isCompletingMeal ||
      isUncompletingMeal,
  }
}
