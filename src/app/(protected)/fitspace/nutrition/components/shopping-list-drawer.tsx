'use client'

import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { ShoppingList } from './shopping-list'

type PlanDay = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface ShoppingListDrawerProps {
  day: PlanDay
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

export function ShoppingListDrawer({ day, planId }: ShoppingListDrawerProps) {
  const [open, setOpen] = useState(false)
  const itemsCount = useMemo(() => getShoppingItemCount(day), [day])

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
      >
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-base font-semibold">Shopping list</p>
              <p className="text-sm text-muted-foreground">
                {itemsCount} items for this day
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xl"
              iconOnly={<ChevronRight />}
              aria-label="Open shopping list"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpen(true)
              }}
            >
              Open
            </Button>
          </div>
        </CardContent>
      </Card>

      <SimpleDrawerContent title="Shopping list">
        <ShoppingList day={day} planId={planId} />
      </SimpleDrawerContent>
    </Drawer>
  )
}

