import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'

import { DailyProgressCard } from './daily-progress-card'
import { useMealPlan } from './meal-plan-context'
import { MealsList } from './meals-list'

export function MealView() {
  const { activeDay, plan } = useMealPlan()

  if (!activeDay) return null

  const dailyTargets = {
    calories: activeDay.targetCalories || plan?.dailyCalories || 0,
    protein: activeDay.targetProtein || plan?.dailyProtein || 0,
    carbs: activeDay.targetCarbs || plan?.dailyCarbs || 0,
    fat: activeDay.targetFat || plan?.dailyFat || 0,
  }

  // Use the logged values if available, otherwise use planned values
  const dailyActual = {
    calories: activeDay.meals.reduce(
      (sum, meal) => sum + (meal.loggedCalories || meal.plannedCalories),
      0,
    ),
    protein: activeDay.meals.reduce(
      (sum, meal) => sum + (meal.loggedProtein || meal.plannedProtein),
      0,
    ),
    carbs: activeDay.meals.reduce(
      (sum, meal) => sum + (meal.loggedCarbs || meal.plannedCarbs),
      0,
    ),
    fat: activeDay.meals.reduce(
      (sum, meal) => sum + (meal.loggedFat || meal.plannedFat),
      0,
    ),
  }

  return (
    <AnimatedPageTransition id={activeDay.id} variant="reveal" mode="wait">
      <div className="space-y-4">
        {/* Daily Progress Overview */}
        <DailyProgressCard
          dailyTargets={dailyTargets}
          dailyActual={dailyActual}
        />

        {/* Meals */}
        <MealsList meals={activeDay.meals} />
      </div>
    </AnimatedPageTransition>
  )
}
