'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  type GQLTeamMealsQuery,
  useAddMealToNutritionPlanDayMutation,
  useGetNutritionPlanQuery,
} from '@/generated/graphql-client'

type LightMeal = NonNullable<GQLTeamMealsQuery['teamMeals']>[number]

interface MealSearchResultsProps {
  meals: LightMeal[]
  dayId: string
  nutritionPlanId: string
  isLoading: boolean
  searchQuery: string
  onMealAdded?: () => void
}

export function MealSearchResults({
  meals,
  dayId,
  nutritionPlanId,
  isLoading,
  searchQuery,
  onMealAdded,
}: MealSearchResultsProps) {
  const queryClient = useQueryClient()
  const addMealMutation = useAddMealToNutritionPlanDayMutation({
    onSuccess: () => {
      toast.success('Meal added to day!')
      onMealAdded?.()
      // Invalidate the nutrition plan query to refresh the UI
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error) => {
      toast.error('Failed to add meal: ' + (error as Error).message)
    },
  })

  const handleAddMeal = (mealId: string) => {
    addMealMutation.mutate({
      input: {
        dayId,
        mealId,
        portionMultiplier: 1.0,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="py-3 text-center text-xs text-muted-foreground min-w-[300px]">
        Searching...
      </div>
    )
  }

  if (meals.length === 0 && searchQuery) {
    return (
      <div className="py-3 text-center text-xs text-muted-foreground min-w-[300px]">
        No meals found
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="py-3 text-center text-xs text-muted-foreground min-w-[300px]">
        Type to search meals
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto min-w-[300px]">
      <div className="text-xs font-medium text-muted-foreground px-1 py-1">
        {meals.length} meal{meals.length !== 1 ? 's' : ''}
      </div>

      {meals.map((meal) => (
        <div
          key={meal.id}
          className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors rounded"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{meal.name}</div>
            <div className="text-xs text-muted-foreground">
              {meal.totalMacros.calories.toFixed(0)} kcal | P:{' '}
              {meal.totalMacros.protein.toFixed(0)}g | C:{' '}
              {meal.totalMacros.carbs.toFixed(0)}g | F:{' '}
              {meal.totalMacros.fat.toFixed(0)}g
            </div>
          </div>

          <Button
            size="icon-sm"
            disabled={addMealMutation.isPending}
            onClick={() => handleAddMeal(meal.id)}
            iconOnly={<Plus />}
          >
            Add
          </Button>
        </div>
      ))}
    </div>
  )
}
