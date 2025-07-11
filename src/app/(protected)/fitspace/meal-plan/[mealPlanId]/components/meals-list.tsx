import { useState } from 'react'

import { CustomFoodSearchDrawer } from './custom-food-search-drawer'
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
      isCustomAddition: boolean
      log?: {
        id: string
        loggedQuantity: number
        unit: string
        loggedAt: string
        notes?: string | null
        calories?: number | null
        protein?: number | null
        carbs?: number | null
        fat?: number | null
        fiber?: number | null
      } | null
    }[]
    plannedCalories: number
    plannedProtein: number
    plannedCarbs: number
    plannedFat: number
    loggedCalories: number
    loggedProtein: number
    loggedCarbs: number
    loggedFat: number
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
  const [customFoodDrawerOpen, setCustomFoodDrawerOpen] = useState(false)

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

  const handleAddCustomFood = (meal: (typeof meals)[0]) => {
    setSelectedMeal(meal)
    setCustomFoodDrawerOpen(true)
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
            onAddCustomFood={() => handleAddCustomFood(meal)}
            onCompleteMeal={handleCompleteMeal}
            onUncompleteMeal={handleUncompleteMeal}
          />
        ))}
      </div>

      {/* Full Meal Logging Drawer */}
      <MealLoggingDrawer
        meal={selectedMeal}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveMealLog}
        isLoading={isLoading}
      />

      {/* Single Food Adjustment Drawer */}
      {/* <SingleFoodAdjustmentDrawer
        food={selectedFood}
        mealName={selectedMeal?.name || ''}
        open={singleFoodDrawerOpen}
        onClose={handleCloseSingleFoodDrawer}
        onSave={handleSaveSingleFood}
        isLoading={isLoading}
      /> */}

      {/* Custom Food Search Drawer */}
      <CustomFoodSearchDrawer
        isOpen={customFoodDrawerOpen}
        onClose={() => setCustomFoodDrawerOpen(false)}
        mealId={selectedMeal?.id || ''}
        onFoodAdded={() => {
          // Invalidate queries to refresh the meal data
          setCustomFoodDrawerOpen(false)
        }}
      />
    </>
  )
}
