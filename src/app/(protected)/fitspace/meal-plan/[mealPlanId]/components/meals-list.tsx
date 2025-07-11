import { useState } from 'react'

import { MealCard } from './meal-card'
import { MealLoggingDrawer } from './meal-logging-drawer'
import { useMealLogging } from './use-meal-logging'

interface MealsListProps {
  meals: {
    id: string
    name: string
    dateTime: string
    instructions?: string | null
    completedAt?: string | null
    foods: {
      id: string
      name: string
      quantity: number
      unit: string
      totalCalories: number
      totalProtein: number
      totalCarbs: number
      totalFat: number
    }[]
    logs: {
      id: string
      completedAt?: string | null
      items: {
        id: string
        name: string
        quantity: number
        calories?: number | null
        protein?: number | null
        carbs?: number | null
        fat?: number | null
      }[]
    }[]
  }[]
}

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

export function MealsList({ meals }: MealsListProps) {
  const [selectedMeal, setSelectedMeal] = useState<(typeof meals)[0] | null>(
    null,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)

  const {
    handleBatchLogMeal,
    handleCompleteMeal,
    handleUncompleteMeal,
    isLoading,
  } = useMealLogging()

  const handleMealClick = (meal: (typeof meals)[0]) => {
    setSelectedMeal(meal)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedMeal(null)
  }

  const handleSaveMealLog = (
    mealId: string,
    foodQuantities: FoodQuantity[],
  ) => {
    handleBatchLogMeal(mealId, foodQuantities)
    handleCloseDrawer()
  }

  return (
    <>
      <div className="space-y-4">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onClick={() => handleMealClick(meal)}
            onCompleteMeal={handleCompleteMeal}
            onUncompleteMeal={handleUncompleteMeal}
          />
        ))}
      </div>

      {/* Meal Logging Drawer */}
      <MealLoggingDrawer
        meal={selectedMeal}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveMealLog}
        isLoading={isLoading}
      />
    </>
  )
}
