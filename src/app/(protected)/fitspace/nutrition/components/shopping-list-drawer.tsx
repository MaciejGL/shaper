'use client'

import { ChevronRight, ShoppingCartIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { ShoppingList } from './shopping-list'

type PlanDay = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface ShoppingListDrawerProps {
  days: PlanDay[]
  activeDay: PlanDay
  planId: string
}

function getShoppingItemCount(day: PlanDay): number {
  const ids = new Set<string>()
  day.meals?.forEach((planMeal) => {
    planMeal.meal.ingredients?.forEach((ingredientItem) => {
      ids.add(ingredientItem.ingredient.name)
    })
  })
  return ids.size
}

export function ShoppingListDrawer({
  days,
  activeDay,
  planId,
}: ShoppingListDrawerProps) {
  const [open, setOpen] = useState(false)
  const itemsCount = useMemo(() => getShoppingItemCount(activeDay), [activeDay])

  if (itemsCount === 0) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Card
        hoverable
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(true)
        }}
        className="shadow-xs"
      >
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingCartIcon className="size-6" />
              <p className="text-base font-medium">
                Open shopping list ({itemsCount})
              </p>
            </div>
            <ChevronRight className="size-6!" />
          </div>
        </CardContent>
      </Card>

      <SimpleDrawerContent title="Shopping list">
        <ShoppingList
          days={days}
          planId={planId}
          initialSelectedDayId={activeDay.id}
        />
      </SimpleDrawerContent>
    </Drawer>
  )
}
