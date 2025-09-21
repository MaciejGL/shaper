'use client'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  type GQLTeamMealsQuery,
  useAddMealToNutritionPlanDayMutation,
} from '@/generated/graphql-client'

type LightMeal = NonNullable<GQLTeamMealsQuery['teamMeals']>[number]

interface MealSearchResultsProps {
  meals: LightMeal[]
  dayId: string
  isLoading: boolean
  searchQuery: string
  onMealAdded?: () => void
}

export function MealSearchResults({
  meals,
  dayId,
  isLoading,
  searchQuery,
  onMealAdded,
}: MealSearchResultsProps) {
  const addMealMutation = useAddMealToNutritionPlanDayMutation({
    onSuccess: () => {
      toast.success('Meal added to day!')
      onMealAdded?.()
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
      <div className="py-3 text-center text-xs text-muted-foreground">
        Searching...
      </div>
    )
  }

  if (meals.length === 0 && searchQuery) {
    return (
      <div className="py-3 text-center text-xs text-muted-foreground">
        No meals found
      </div>
    )
  }

  if (meals.length === 0) {
    return (
      <div className="py-3 text-center text-xs text-muted-foreground">
        Type to search meals
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
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
              {meal.totalMacros.calories} kcal | P: {meal.totalMacros.protein}g
              | C: {meal.totalMacros.carbs}g | F: {meal.totalMacros.fat}g
            </div>
          </div>

          <Button
            size="sm"
            disabled={addMealMutation.isPending}
            onClick={() => handleAddMeal(meal.id)}
            className="ml-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
