'use client'

import { useParams } from 'next/navigation'

import { MealPlanProvider } from '@/context/meal-plan-context/meal-plan-context'

import { MealPlanCreator } from '../components/meal-plan-creator'

export default function MealPlanCreatorPage() {
  const { mealPlanId } = useParams<{ mealPlanId: string }>()

  return (
    <div className="h-full">
      <MealPlanProvider mealPlanId={mealPlanId}>
        <MealPlanCreator />
      </MealPlanProvider>
    </div>
  )
}
