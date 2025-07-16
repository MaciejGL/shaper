import { useQueryClient } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { toast } from 'sonner'

import {
  GQLAddCustomFoodToMealMutation,
  GQLGetDefaultMealPlanQuery,
  useAddCustomFoodToMealMutation,
  useBatchLogMealFoodMutation,
  useCompleteMealMutation,
  useGetActiveMealPlanQuery,
  useGetDefaultMealPlanQuery,
  useRemoveMealLogMutation,
  useUncompleteMealMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import {
  createTimestampWithDateAndCurrentTime,
  getStartOfWeekUTC,
  toISOString,
} from '@/lib/utc-date-utils'

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
  const [date] = useQueryState('date') // Get current date from URL

  // Debounced invalidation to prevent excessive refetches when users rapidly add/remove foods
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetDefaultMealPlan'],
    delay: 1000, // 1 second delay - good balance between responsiveness and efficiency
  })

  const dateParam = useMemo(() => {
    return date
      ? toISOString(getStartOfWeekUTC(date))
      : toISOString(getStartOfWeekUTC(new Date()))
  }, [date])
  const defaultMealPlanKey = useMemo(
    () => useGetDefaultMealPlanQuery.getKey({ date: dateParam }),
    [dateParam],
  )
  const activeMealPlanKey = useMemo(
    () => useGetActiveMealPlanQuery.getKey({ date: dateParam }),
    [dateParam],
  )

  const { mutateAsync: batchLogMealFood, isPending: isBatchLoggingFood } =
    useBatchLogMealFoodMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: defaultMealPlanKey })
        queryClient.invalidateQueries({
          queryKey: activeMealPlanKey,
        })
      },
      onError: (error) => {
        toast.error('Something went wrong while logging meal foods')
        console.error('Error batch logging meal foods:', error)
      },
    })

  const { mutateAsync: completeMeal, isPending: isCompletingMeal } =
    useCompleteMealMutation({
      onSuccess: (data, variables) => {
        debouncedInvalidateQueries()
        queryClient.setQueryData(
          defaultMealPlanKey,
          (oldData: GQLGetDefaultMealPlanQuery | undefined) => {
            if (!oldData?.getDefaultMealPlan) return oldData

            const currentTime = new Date().toISOString()

            return {
              ...oldData,
              getDefaultMealPlan: {
                ...oldData.getDefaultMealPlan,
                weeks: oldData.getDefaultMealPlan.weeks.map((week) => ({
                  ...week,
                  days: week.days.map((day) => ({
                    ...day,
                    meals: day.meals.map((meal) =>
                      meal.id === variables.mealId
                        ? { ...meal, completedAt: currentTime }
                        : meal,
                    ),
                  })),
                })),
              },
            }
          },
        )
      },
      onError: (error) => {
        toast.error('Something went wrong while completing meal')
        console.error('Error completing meal:', error)
      },
    })

  const { mutateAsync: uncompleteMeal, isPending: isUncompletingMeal } =
    useUncompleteMealMutation({
      onSuccess: (data, variables) => {
        debouncedInvalidateQueries()

        queryClient.setQueryData(
          defaultMealPlanKey,
          (oldData: GQLGetDefaultMealPlanQuery | undefined) => {
            if (!oldData?.getDefaultMealPlan) return oldData

            return {
              ...oldData,
              getDefaultMealPlan: {
                ...oldData.getDefaultMealPlan,
                weeks: oldData.getDefaultMealPlan.weeks.map((week) => ({
                  ...week,
                  days: week.days.map((day) => ({
                    ...day,
                    meals: day.meals.map((meal) =>
                      meal.id === variables.mealId
                        ? { ...meal, completedAt: null }
                        : meal,
                    ),
                  })),
                })),
              },
            }
          },
        )
      },

      onError: (error) => {
        toast.error('Something went wrong while uncompleting meal')
        console.error('Error uncompleting meal:', error)
      },
    })

  const { mutateAsync: addCustomFoodToMeal, isPending: isAddingCustomFood } =
    useAddCustomFoodToMealMutation({
      onSuccess: (data: GQLAddCustomFoodToMealMutation, variables) => {
        debouncedInvalidateQueries()

        queryClient.setQueryData(
          defaultMealPlanKey,
          (oldData: GQLGetDefaultMealPlanQuery | undefined) => {
            if (!oldData?.getDefaultMealPlan) return oldData

            // Create the new MealFood from the input and returned log data with real IDs
            const newMealFood = {
              __typename: 'MealFood' as const,
              id: data.addCustomFoodToMeal.mealFood.id, // Real ID from server
              name: data.addCustomFoodToMeal.mealFood.name,
              quantity: variables.input.quantity,
              unit: variables.input.unit,
              addedAt: data.addCustomFoodToMeal.mealFood.addedAt,
              caloriesPer100g: variables.input.caloriesPer100g || null,
              proteinPer100g: variables.input.proteinPer100g || null,
              carbsPer100g: variables.input.carbsPer100g || null,
              fatPer100g: variables.input.fatPer100g || null,
              fiberPer100g: variables.input.fiberPer100g || null,
              totalCalories:
                ((variables.input.caloriesPer100g || 0) *
                  variables.input.quantity) /
                100,
              totalProtein:
                ((variables.input.proteinPer100g || 0) *
                  variables.input.quantity) /
                100,
              totalCarbs:
                ((variables.input.carbsPer100g || 0) *
                  variables.input.quantity) /
                100,
              totalFat:
                ((variables.input.fatPer100g || 0) * variables.input.quantity) /
                100,
              totalFiber:
                ((variables.input.fiberPer100g || 0) *
                  variables.input.quantity) /
                100,
              openFoodFactsId: variables.input.openFoodFactsId || null,
              productData: null,
              isCustomAddition: true,
              addedBy: data.addCustomFoodToMeal.mealFood.addedBy,
              log: data.addCustomFoodToMeal, // Real log with server ID
              logs: [data.addCustomFoodToMeal], // Real logs array
            }

            return {
              ...oldData,
              getDefaultMealPlan: {
                ...oldData.getDefaultMealPlan,
                weeks: oldData.getDefaultMealPlan.weeks.map((week) => ({
                  ...week,
                  days: week.days.map((day) => ({
                    ...day,
                    meals: day.meals.map((meal) =>
                      meal.id === variables.input.mealId
                        ? { ...meal, foods: [...meal.foods, newMealFood] }
                        : meal,
                    ),
                  })),
                })),
              },
            }
          },
        )
      },

      onError: (error) => {
        toast.error('Failed to add food to meal')
        console.error('Error adding food to meal:', error)
      },
    })

  const { mutateAsync: removeLog, isPending: isRemovingLogItem } =
    useRemoveMealLogMutation({
      onSuccess: (data, variables) => {
        debouncedInvalidateQueries()

        queryClient.setQueryData(
          defaultMealPlanKey,
          (oldData: GQLGetDefaultMealPlanQuery | undefined) => {
            if (!oldData?.getDefaultMealPlan) return oldData

            return {
              ...oldData,
              getDefaultMealPlan: {
                ...oldData.getDefaultMealPlan,
                weeks: oldData.getDefaultMealPlan.weeks.map((week) => ({
                  ...week,
                  days: week.days.map((day) => ({
                    ...day,
                    meals: day.meals.map((meal) => ({
                      ...meal,
                      foods: meal.foods.filter(
                        (food) => food.id !== variables.foodId,
                      ),
                    })),
                  })),
                })),
              },
            }
          },
        )
      },

      onError: (error) => {
        toast.error('Something went wrong while removing food')
        console.error('Error removing food:', error)
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
        loggedAt: createTimestampWithDateAndCurrentTime(date), // Date being viewed + current time
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
    return await removeLog({ foodId })
  }

  const handleAddCustomFood = async (input: {
    mealId: string
    name: string
    quantity: number
    unit: string
    caloriesPer100g?: number
    proteinPer100g?: number
    carbsPer100g?: number
    fatPer100g?: number
    fiberPer100g?: number
    openFoodFactsId?: string
    loggedAt?: string
  }) => {
    return await addCustomFoodToMeal({ input })
  }

  return {
    handleBatchLogMeal,
    handleCompleteMeal,
    handleUncompleteMeal,
    handleRemoveLogItem,
    handleAddCustomFood,
    isRemovingLogItem,
    isAddingCustomFood,
    // Export specific loading states for better UX
    isCompletingMeal,
    isUncompletingMeal,
    isBatchLoggingFood,
    isLoading:
      isBatchLoggingFood ||
      isCompletingMeal ||
      isUncompletingMeal ||
      isRemovingLogItem ||
      isAddingCustomFood,
  }
}
