'use client'

import { Flame } from 'lucide-react'

import { Divider } from '@/components/divider'
import {
  Drawer,
  DrawerTitle,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

type PlanMeal = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]['meals'][number]

interface MealDetailDrawerProps {
  planMeal: PlanMeal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MealDetailDrawer({
  planMeal,
  open,
  onOpenChange,
}: MealDetailDrawerProps) {
  if (!planMeal) return null

  const { meal, adjustedMacros, ingredientOverrides } = planMeal

  const getIngredientGrams = (
    mealIngredientId: string,
    defaultGrams: number,
  ) => {
    const override = ingredientOverrides.find(
      (o) => o.mealIngredient.id === mealIngredientId,
    )
    return override ? override.grams : defaultGrams
  }

  const sortedIngredients = [...meal.ingredients].sort(
    (a, b) => a.order - b.order,
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <SimpleDrawerContent
        title={meal.name}
        classNameDrawerContent="data-[vaul-drawer-direction=bottom]:max-h-[calc(66dvh-var(--safe-area-inset-bottom,0px)-var(--safe-area-inset-top,0px))]"
        header={
          <div className="space-y-1.5 text-left">
            <DrawerTitle className="text-xl font-bold leading-tight">
              {meal.name}
            </DrawerTitle>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flame className="size-3.5 fill-orange-500 text-orange-500" />
                <span>{Math.round(adjustedMacros.calories)} kcal</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-3">
                <span>P {Math.round(adjustedMacros.protein)}</span>
                <span>C {Math.round(adjustedMacros.carbs)}</span>
                <span>F {Math.round(adjustedMacros.fat)}</span>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          {meal.description && (
            <p className="text-sm text-muted-foreground">{meal.description}</p>
          )}

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Ingredients</h3>
            <div className="space-y-0">
              {sortedIngredients.map((ingredient) => {
                const grams = getIngredientGrams(
                  ingredient.id,
                  ingredient.grams,
                )
                return (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-muted-foreground/30" />
                      <span className="text-sm font-medium">
                        {ingredient.ingredient.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {Math.round(grams)} g
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <Divider className="last:hidden" />

          {meal.instructions.length > 0 && (
            <section className="space-y-2">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Steps</h3>
              </div>
              <div className="space-y-4">
                {meal.instructions.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="flex-none text-sm font-medium leading-relaxed">
                      {index + 1}.
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
