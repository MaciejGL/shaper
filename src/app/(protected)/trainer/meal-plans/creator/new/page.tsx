'use client'

import { MealPlanProvider } from '@/context/meal-plan-context/meal-plan-context'

import MealPlanCreator from '../components/meal-plan-creator'

export default function CreateMealPlanPage() {
  return (
    <div className="h-full flex flex-col">
      <MealPlanProvider>
        <MealPlanCreator />
      </MealPlanProvider>
    </div>
  )
}
