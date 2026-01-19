'use client'

import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useUpdateNutritionPlanMealIngredientMutation,
} from '@/generated/graphql-client'

interface UseIngredientEditingProps {
  planMeal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]
  nutritionPlanId: string
  dayId: string
}

type Macros = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type MealIngredient = NonNullable<
  GQLGetNutritionPlanQuery['nutritionPlan']
>['days'][number]['meals'][number]['meal']['ingredients'][number]

type IngredientOverride = NonNullable<
  GQLGetNutritionPlanQuery['nutritionPlan']
>['days'][number]['meals'][number]['ingredientOverrides'][number]

/**
 * Calculate macros for a meal based on ingredients and overrides
 */
function calculateMealMacros(
  ingredients: MealIngredient[],
  overrides: IngredientOverride[],
): Macros {
  const overrideMap = new Map(
    overrides.map((override) => [override.mealIngredient.id, override.grams]),
  )

  return ingredients.reduce(
    (totals, mealIngredient) => {
      // Use override grams if available, otherwise use blueprint grams
      const grams = overrideMap.get(mealIngredient.id) ?? mealIngredient.grams
      const multiplier = grams / 100

      return {
        protein:
          totals.protein +
          mealIngredient.ingredient.proteinPer100g * multiplier,
        carbs:
          totals.carbs + mealIngredient.ingredient.carbsPer100g * multiplier,
        fat: totals.fat + mealIngredient.ingredient.fatPer100g * multiplier,
        calories:
          totals.calories +
          mealIngredient.ingredient.caloriesPer100g * multiplier,
      }
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  )
}

/**
 * Calculate daily macros from all meals
 */
function calculateDayMacros(
  meals: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'],
): Macros {
  return meals.reduce(
    (totals, meal) => ({
      protein: totals.protein + meal.adjustedMacros.protein,
      carbs: totals.carbs + meal.adjustedMacros.carbs,
      fat: totals.fat + meal.adjustedMacros.fat,
      calories: totals.calories + meal.adjustedMacros.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  )
}

/**
 * Optimistic update function for ingredient changes
 * Updates ingredient overrides and recalculates meal and day macros
 */
function updateIngredientOptimistically(
  oldData: GQLGetNutritionPlanQuery,
  variables: {
    dayId: string
    planMealId: string
    ingredientId: string
    grams: number
  },
): GQLGetNutritionPlanQuery {
  if (!oldData?.nutritionPlan?.days) return oldData

  return {
    ...oldData,
    nutritionPlan: {
      ...oldData.nutritionPlan,
      days: oldData.nutritionPlan.days.map((day) => {
        if (day.id !== variables.dayId) return day

        // Update meals with new overrides and recalculated macros
        const updatedMeals = day.meals.map((meal) => {
          if (meal.id !== variables.planMealId) return meal

          // Find if override exists
          const existingOverride = meal.ingredientOverrides?.find(
            (o) => o.mealIngredient.id === variables.ingredientId,
          )

          // Find the meal ingredient
          const mealIngredient = meal.meal.ingredients?.find(
            (mi) => mi.id === variables.ingredientId,
          )

          if (!mealIngredient) return meal

          // Update or create override
          const updatedOverrides = existingOverride
            ? // Update existing override
              meal.ingredientOverrides.map((o) =>
                o.mealIngredient.id === variables.ingredientId
                  ? { ...o, grams: variables.grams }
                  : o,
              )
            : // Create new override
              [
                ...(meal.ingredientOverrides || []),
                {
                  id: `temp-${variables.ingredientId}`,
                  grams: variables.grams,
                  createdAt: new Date().toISOString(),
                  mealIngredient,
                },
              ]

          // Recalculate meal macros with updated overrides
          const adjustedMacros = calculateMealMacros(
            meal.meal.ingredients || [],
            updatedOverrides,
          )

          return {
            ...meal,
            ingredientOverrides: updatedOverrides,
            adjustedMacros,
          }
        })

        // Recalculate day macros from all meals
        const dailyMacros = calculateDayMacros(updatedMeals)

        return {
          ...day,
          meals: updatedMeals,
          dailyMacros,
        }
      }),
    },
  }
}

export function useIngredientEditing({
  planMeal,
  nutritionPlanId,
  dayId,
}: UseIngredientEditingProps) {
  const queryClient = useQueryClient()
  const meal = planMeal.meal

  // Memoize queryKey to prevent recreating debounced function
  const queryKey = useMemo(
    () => useGetNutritionPlanQuery.getKey({ id: nutritionPlanId }),
    [nutritionPlanId],
  )

  // State for ingredient gram editing
  const [ingredientGrams, setIngredientGrams] = useState<
    Record<string, string>
  >({})

  // Track latest variables per ingredient to prevent stale mutations
  const latestGramsRef = useRef<Record<string, number>>({})

  // Initialize ingredient grams from props
  useEffect(() => {
    const initialGrams: Record<string, string> = {}
    const initialLatestGrams: Record<string, number> = {}

    meal.ingredients?.forEach((mealIngredient) => {
      // Check if there's an override for this ingredient
      const override = planMeal.ingredientOverrides?.find(
        (o) => o.mealIngredient.id === mealIngredient.id,
      )
      const currentGrams = override?.grams ?? mealIngredient.grams

      initialGrams[mealIngredient.id] = currentGrams.toString()
      initialLatestGrams[mealIngredient.id] = currentGrams
    })

    setIngredientGrams(initialGrams)
    latestGramsRef.current = initialLatestGrams
  }, [planMeal.ingredientOverrides, meal.ingredients])

  // Mutation for updating ingredient
  const { mutateAsync: updateIngredientMutation } =
    useUpdateNutritionPlanMealIngredientMutation()

  // Create debounced mutation function
  const debouncedUpdateIngredient = useMemo(
    () =>
      debounce(
        async (ingredientId: string, grams: number) => {
          // Skip if newer data has been typed (prevents stale API calls)
          if (latestGramsRef.current[ingredientId] !== grams) {
            return
          }

          try {
            await updateIngredientMutation({
              input: {
                planMealId: planMeal.id,
                mealIngredientId: ingredientId,
                grams,
              },
            })
          } catch (error) {
            console.error('[UpdateIngredient]: API call failed', {
              ingredientId,
              error,
            })
            toast.error(
              'Failed to update ingredient: ' + (error as Error).message,
            )
            // Rollback on error
            queryClient.invalidateQueries({ queryKey })
          }
        },
        500, // 500ms debounce
      ),
    [updateIngredientMutation, planMeal.id, queryClient, queryKey],
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateIngredient.cancel()
    }
  }, [debouncedUpdateIngredient])

  const handleIngredientGramChange = useCallback(
    (ingredientId: string, value: string) => {
      // Allow only numbers and decimal point
      const sanitizedValue = value.replace(/[^0-9.]/g, '')

      // Update local state immediately for responsive UI
      setIngredientGrams((prev) => ({
        ...prev,
        [ingredientId]: sanitizedValue,
      }))

      // Apply optimistic update and schedule debounced API call
      const grams = parseFloat(sanitizedValue)
      if (!isNaN(grams) && grams >= 0) {
        // Store latest grams for stale check
        latestGramsRef.current[ingredientId] = grams

        // Apply optimistic update immediately for instant UI feedback
        queryClient.setQueryData<GQLGetNutritionPlanQuery>(
          queryKey,
          (oldData) => {
            if (!oldData) return oldData
            return updateIngredientOptimistically(oldData, {
              dayId,
              planMealId: planMeal.id,
              ingredientId,
              grams,
            })
          },
        )

        // Schedule debounced API call (only latest will execute)
        debouncedUpdateIngredient(ingredientId, grams)
      }
    },
    [queryClient, queryKey, dayId, planMeal.id, debouncedUpdateIngredient],
  )

  const formatIngredientValue = useCallback(
    (ingredientId: string, value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed) && parsed >= 0) {
        const formatted = Math.round(parsed * 10) / 10 // Round to 1 decimal
        setIngredientGrams((prev) => ({
          ...prev,
          [ingredientId]: formatted.toString(),
        }))
      } else {
        // Reset to current value if invalid
        const override = planMeal.ingredientOverrides?.find(
          (o) => o.mealIngredient.id === ingredientId,
        )
        const mealIngredient = meal.ingredients?.find(
          (mi) => mi.id === ingredientId,
        )
        const currentGrams = override?.grams ?? mealIngredient?.grams ?? 0
        setIngredientGrams((prev) => ({
          ...prev,
          [ingredientId]: currentGrams.toString(),
        }))
      }
    },
    [planMeal.ingredientOverrides, meal.ingredients],
  )

  return {
    ingredientGrams,
    handleIngredientGramChange,
    formatIngredientValue,
  }
}
