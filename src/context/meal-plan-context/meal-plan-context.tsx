'use client'

import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { ReactNode, createContext, useCallback, useContext } from 'react'
import { toast } from 'sonner'

import {
  GQLGetMealPlanByIdQuery,
  useGetMealPlanByIdQuery,
  useSaveMealMutation,
} from '@/generated/graphql-client'

// Types for the context
type MealPlanData = GQLGetMealPlanByIdQuery['getMealPlanById']
type Meal = MealPlanData['weeks'][0]['days'][0]['meals'][0]

// Simplified food type for editing
export interface EditableFood {
  id?: string // Optional for new foods
  name: string
  quantity: number | null // Allow null for empty inputs
  unit: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  openFoodFactsId?: string | null
}

interface MealPlanContextType {
  // Data
  mealPlan: MealPlanData | null
  isLoading: boolean

  // Actions
  saveMeal: (
    dayId: string,
    hour: number,
    foods: EditableFood[],
    instructions: string,
  ) => Promise<void>
  getMealByHour: (dayId: string, hour: number) => Meal | null
  refetchMealPlan: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<GQLGetMealPlanByIdQuery, unknown>>
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(
  undefined,
)

export function useMealPlanContext() {
  const context = useContext(MealPlanContext)
  if (!context) {
    throw new Error('useMealPlanContext must be used within a MealPlanProvider')
  }
  return context
}

interface MealPlanProviderProps {
  children: ReactNode
  mealPlanId: string
}

export function MealPlanProvider({
  children,
  mealPlanId,
}: MealPlanProviderProps) {
  // GraphQL queries and mutations
  const {
    data: mealPlanData,
    isLoading,
    refetch,
  } = useGetMealPlanByIdQuery(
    { id: mealPlanId },
    { enabled: !!mealPlanId, refetchOnMount: 'always' },
  )

  const saveMealMutation = useSaveMealMutation()

  const getMealByHour = useCallback(
    (dayId: string, hour: number) => {
      if (!mealPlanData?.getMealPlanById) return null

      for (const week of mealPlanData.getMealPlanById.weeks) {
        for (const day of week.days) {
          if (day.id === dayId) {
            return (
              day.meals.find(
                (meal) => new Date(meal.dateTime).getUTCHours() === hour,
              ) || null
            )
          }
        }
      }
      return null
    },
    [mealPlanData],
  )

  const saveMeal = useCallback(
    async (
      dayId: string,
      hour: number,
      foods: EditableFood[],
      instructions: string,
    ) => {
      try {
        // Convert EditableFood to the format expected by the mutation
        // Filter out foods with null quantities first
        const mealFoods = foods
          .filter((food) => food.quantity !== null && food.quantity > 0)
          .map((food) => ({
            id: food.id || null,
            name: food.name,
            quantity: food.quantity!, // We know it's not null due to filter
            unit: food.unit,
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
            fiberPer100g: food.fiberPer100g,
            openFoodFactsId: food.openFoodFactsId,
            productData: null, // We don't use productData in the UI currently
          }))

        await saveMealMutation.mutateAsync({
          input: {
            dayId,
            hour,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            instructions,
            foods: mealFoods,
          },
        })

        // Refetch data to get latest state
        await refetch()
        toast.success('Meal saved successfully!')
      } catch (error) {
        console.error('Error saving meal:', error)
        toast.error('Failed to save meal. Please try again.')
        throw error
      }
    },
    [saveMealMutation, refetch],
  )

  const value: MealPlanContextType = {
    mealPlan: mealPlanData?.getMealPlanById || null,
    isLoading,
    saveMeal,
    getMealByHour,
    refetchMealPlan: refetch,
  }

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}
