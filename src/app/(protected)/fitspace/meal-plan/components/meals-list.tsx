import { useState } from 'react'

import { CustomFoodSearchDrawer } from './custom-food-search-drawer'
import { MealCard } from './meal-card'
import { MealLoggingDrawer } from './meal-logging-drawer'
import { Meal, useMealPlan } from './meal-plan-context'
import { useMealLogging } from './use-meal-logging'

interface MealsListProps {
  planMeals: Meal[]
  allowCustomFood?: boolean // Controls whether custom food additions are allowed
  isLoading?: boolean
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

export function MealsList({
  planMeals,
  allowCustomFood = false,
}: MealsListProps) {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [customFoodDrawerOpen, setCustomFoodDrawerOpen] = useState(false)
  const { isLoading } = useMealPlan()

  const { handleBatchLogMeal, isBatchLoggingFood } = useMealLogging()

  const handleMealClick = (meal?: Meal | null) => {
    if (!meal) {
      setSelectedMealId(null)
      setDrawerOpen(false)
      return
    }
    setSelectedMealId(meal.id)
    setDrawerOpen(true)
  }

  const handleAddCustomFood = (meal: Meal) => {
    setSelectedMealId(meal.id)
    setCustomFoodDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedMealId(null)
  }

  const handleSaveMealLog = async (
    mealId: string,
    foodQuantities: FoodQuantity[],
  ) => {
    await handleBatchLogMeal(mealId, foodQuantities)
    handleCloseDrawer()
  }

  return (
    <>
      <div className="space-y-6 grow">
        {planMeals.map((meal) => {
          return (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={() => handleMealClick(meal)}
              onAddCustomFood={
                // Only show add custom food when allowed
                allowCustomFood ? () => handleAddCustomFood(meal) : undefined
              }
              isDefaultPlan={allowCustomFood}
            />
          )
        })}
        {planMeals.length === 0 && !isLoading && (
          <div className="text-center text-sm text-muted-foreground min-h-[45dvh]">
            No meals found
          </div>
        )}
      </div>

      {/* Full Meal Logging Drawer */}
      <MealLoggingDrawer
        meal={planMeals.find((meal) => meal.id === selectedMealId) || null}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveMealLog}
        isLoading={isBatchLoggingFood}
      />

      {/* Custom Food Search Drawer */}
      {selectedMealId && allowCustomFood && customFoodDrawerOpen && (
        <CustomFoodSearchDrawer
          isOpen={customFoodDrawerOpen}
          onClose={() => setCustomFoodDrawerOpen(false)}
          mealId={selectedMealId}
          onShowMeal={() =>
            handleMealClick(
              planMeals.find((meal) => meal.id === selectedMealId) || null,
            )
          }
          selectedMeal={
            planMeals.find((meal) => meal.id === selectedMealId) || null
          }
        />
      )}
    </>
  )
}
