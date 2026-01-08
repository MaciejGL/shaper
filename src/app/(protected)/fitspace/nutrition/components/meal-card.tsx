'use client'

import { ChevronRight, FlameIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

type PlanMeal = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]['meals'][number]

interface MealCardProps {
  planMeal: PlanMeal
  onClick: () => void
}

export function MealCard({ planMeal, onClick }: MealCardProps) {
  const { meal, adjustedMacros } = planMeal
  const { calories, protein, carbs, fat } = adjustedMacros

  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className="cursor-pointer shadow-xs"
    >
      <CardContent>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 w-full">
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">{meal.name}</p>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <FlameIcon className="size-3 fill-orange-500 text-orange-500" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(calories)} kcal
                </span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                P {Math.round(protein)}{' '}
                <span className="text-muted-foreground/50">•</span> C{' '}
                {Math.round(carbs)}{' '}
                <span className="text-muted-foreground/50">•</span> F{' '}
                {Math.round(fat)}
              </p>
            </div>
          </div>

          <ChevronRight className="size-6 shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}
