'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useUpdateNutritionPlanMealIngredientMutation,
} from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'

interface UseIngredientEditingProps {
  planMeal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]
  nutritionPlanId: string
  dayId: string
}

export function useIngredientEditing({
  planMeal,
  nutritionPlanId,
  dayId,
}: UseIngredientEditingProps) {
  const queryClient = useQueryClient()
  const meal = planMeal.meal

  // State for ingredient gram editing
  const [ingredientGrams, setIngredientGrams] = useState<
    Record<string, string>
  >({})
  const lastSentGramsRef = useRef<Record<string, number>>({})

  // Initialize ingredient grams from props
  useEffect(() => {
    const initialGrams: Record<string, string> = {}
    const initialSentGrams: Record<string, number> = {}

    meal.ingredients?.forEach((mealIngredient) => {
      // Check if there's an override for this ingredient
      const override = planMeal.ingredientOverrides?.find(
        (o) => o.mealIngredient.id === mealIngredient.id,
      )
      const currentGrams = override?.grams ?? mealIngredient.grams

      initialGrams[mealIngredient.id] = currentGrams.toString()
      initialSentGrams[mealIngredient.id] = currentGrams
    })

    setIngredientGrams(initialGrams)
    lastSentGramsRef.current = initialSentGrams
  }, [planMeal.ingredientOverrides, meal.ingredients])

  // Debounce ingredient input changes
  const debouncedIngredientGrams = useDebounce(ingredientGrams, 500)

  const updateIngredientMutation = useUpdateNutritionPlanMealIngredientMutation(
    {
      onError: (err: unknown, variables) => {
        toast.error('Failed to update ingredient: ' + (err as Error).message)
        // Rollback optimistic update
        const queryKey = useGetNutritionPlanQuery.getKey({
          id: nutritionPlanId,
        })
        queryClient.invalidateQueries({ queryKey })

        // Reset input to last known server state
        const ingredientId = variables.input.mealIngredientId
        const lastKnownGrams = lastSentGramsRef.current[ingredientId]
        if (lastKnownGrams !== undefined) {
          setIngredientGrams((prev) => ({
            ...prev,
            [ingredientId]: lastKnownGrams.toString(),
          }))
        }
      },
    },
  )

  // Trigger debounced mutation when debouncedIngredientGrams changes
  useEffect(() => {
    Object.entries(debouncedIngredientGrams).forEach(
      ([ingredientId, gramsStr]) => {
        const grams = parseFloat(gramsStr)
        if (isNaN(grams) || grams <= 0) return

        const lastSentGrams = lastSentGramsRef.current[ingredientId]
        if (grams !== lastSentGrams) {
          lastSentGramsRef.current[ingredientId] = grams
          updateIngredientMutation.mutate({
            input: {
              planMealId: planMeal.id,
              mealIngredientId: ingredientId,
              grams,
            },
          })
        }
      },
    )
  }, [debouncedIngredientGrams, planMeal.id, updateIngredientMutation])

  const handleIngredientGramChange = useCallback(
    (ingredientId: string, value: string) => {
      // Allow only numbers and decimal point
      const sanitizedValue = value.replace(/[^0-9.]/g, '')

      // Update local state immediately for responsive UI
      setIngredientGrams((prev) => ({
        ...prev,
        [ingredientId]: sanitizedValue,
      }))

      // Apply optimistic update to cache immediately
      const grams = parseFloat(sanitizedValue)
      if (!isNaN(grams) && grams > 0) {
        const queryKey = useGetNutritionPlanQuery.getKey({
          id: nutritionPlanId,
        })
        queryClient.setQueryData(
          queryKey,
          (oldData: GQLGetNutritionPlanQuery) => {
            if (!oldData?.nutritionPlan?.days) return oldData

            return {
              ...oldData,
              nutritionPlan: {
                ...oldData.nutritionPlan,
                days: oldData.nutritionPlan.days.map((day) =>
                  day.id === dayId
                    ? {
                        ...day,
                        meals: day.meals.map((meal) =>
                          meal.id === planMeal.id
                            ? {
                                ...meal,
                                // Update or add ingredient override
                                ingredientOverrides: [
                                  ...(meal.ingredientOverrides?.filter(
                                    (o) => o.mealIngredient.id !== ingredientId,
                                  ) || []),
                                  // Add new override (this is a simplified version - real data would need proper structure)
                                  ...(meal.ingredientOverrides
                                    ?.filter(
                                      (o) =>
                                        o.mealIngredient.id === ingredientId,
                                    )
                                    .map((o) => ({ ...o, grams })) || []),
                                ],
                              }
                            : meal,
                        ),
                      }
                    : day,
                ),
              },
            }
          },
        )
      }
    },
    [nutritionPlanId, dayId, planMeal.id, queryClient],
  )

  const formatIngredientValue = useCallback(
    (ingredientId: string, value: string) => {
      const parsed = parseFloat(value)
      if (!isNaN(parsed) && parsed > 0) {
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
