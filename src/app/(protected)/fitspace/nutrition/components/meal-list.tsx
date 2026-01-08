'use client'

import { useState } from 'react'

import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { MealCard } from './meal-card'
import { MealDetailDrawer } from './meal-detail-drawer'

type PlanDay = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]

type PlanMeal = PlanDay['meals'][number]

interface MealListProps {
  meals: PlanMeal[]
}

export function MealList({ meals }: MealListProps) {
  const [selectedMeal, setSelectedMeal] = useState<PlanMeal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMealClick = (meal: PlanMeal) => {
    setSelectedMeal(meal)
    setDrawerOpen(true)
  }

  const sortedMeals = [...meals].sort((a, b) => a.orderIndex - b.orderIndex)

  if (sortedMeals.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No meals planned for this day</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {sortedMeals.map((planMeal) => (
          <MealCard
            key={planMeal.id}
            planMeal={planMeal}
            onClick={() => handleMealClick(planMeal)}
          />
        ))}
      </div>

      <MealDetailDrawer
        planMeal={selectedMeal}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}
