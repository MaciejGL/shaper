'use client'

import { ChefHat, Salad } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'
import { cn } from '@/lib/utils'

interface DayMealsAccordionProps {
  day: NonNullable<GQLGetMyNutritionPlanQuery['nutritionPlan']>['days'][number]
}

export function DayMealsAccordion({ day }: DayMealsAccordionProps) {
  const { formatIngredient } = useCookingUnits()

  const meals = day.meals || []

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No meals planned for this day</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <DayMealsHeader day={day} />

      <Accordion type="single" collapsible className="space-y-2">
        {meals
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((planMeal) => {
            const meal = planMeal.meal
            const macros = planMeal.adjustedMacros

            return (
              <AccordionItem
                key={planMeal.id}
                value={planMeal.id}
                className="rounded-lg bg-card border-none"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-left">{meal.name}</span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    {/* Meal Description */}
                    {meal.description && (
                      <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {meal.description}
                        </p>
                      </div>
                    )}

                    {/* Nutrition Information */}
                    <div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-muted/30 rounded">
                          <div className="text-base font-semibold text-primary">
                            {Math.round(macros?.calories || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            calories
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded">
                          <div className="text-base font-semibold text-green-600">
                            {Math.round(macros?.protein || 0)}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            protein
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded">
                          <div className="text-base font-semibold text-blue-600">
                            {Math.round(macros?.carbs || 0)}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            carbs
                          </div>
                        </div>
                        <div className="text-center p-3 bg-muted/30 rounded">
                          <div className="text-base font-semibold text-yellow-600">
                            {Math.round(macros?.fat || 0)}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            fat
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Salad className="h-4 w-4 text-primary" />
                        Ingredients
                      </h4>
                      {meal.ingredients && meal.ingredients.length > 0 ? (
                        <div className="space-y-2">
                          {meal.ingredients
                            .sort((a, b) => a.order - b.order)
                            .map((ingredientItem, index) => {
                              // Use override grams if available, otherwise use blueprint grams
                              const override =
                                planMeal.ingredientOverrides?.find(
                                  (o) =>
                                    o.mealIngredient.id === ingredientItem.id,
                                )
                              const adjustedGrams =
                                override?.grams ?? ingredientItem.grams
                              return (
                                <div
                                  key={ingredientItem.id}
                                  className="flex items-center gap-2 py-1"
                                >
                                  <span>{index + 1}.</span>
                                  <span>{ingredientItem.ingredient.name}</span>
                                  <span className="flex-1 border-b border-dotted border-border self-end mx-1 mb-1 h-0" />
                                  <span className="text-sm text-muted-foreground">
                                    {formatIngredient(
                                      adjustedGrams,
                                      ingredientItem.ingredient.name,
                                    )}
                                  </span>
                                </div>
                              )
                            })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No ingredients listed for this meal
                        </p>
                      )}
                    </div>

                    {/* Cooking Instructions */}
                    {meal.instructions && meal.instructions.length > 0 && (
                      <>
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-primary" />
                            Cooking Instructions
                          </h4>
                          <div className="space-y-3">
                            {meal.instructions.map((instruction, index) => (
                              <div key={index} className="flex gap-3">
                                <div className="flex-shrink-0 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                                  {index + 1}
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground pt-1">
                                  {instruction}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
      </Accordion>
    </div>
  )
}

export function DayMealsHeader({
  day,
  loading,
}: {
  day?: NonNullable<GQLGetMyNutritionPlanQuery['nutritionPlan']>['days'][number]
  loading?: boolean
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <SectionIcon icon={ChefHat} size="xs" variant="amber" />
      <p>Menu</p>
      <div className="grid grid-cols-[auto_auto_auto_auto] gap-2 w-max ml-auto">
        <div
          className={cn(
            'text-center text-sm font-medium px-1 py-0.5 bg-card rounded-lg',
            loading && 'masked-placeholder-text',
          )}
        >
          {Math.round(day?.dailyMacros?.calories || 0)} cal
        </div>
        <div
          className={cn(
            'text-center text-sm font-medium px-1 py-0.5 bg-card rounded-lg text-blue-600',
            loading && 'masked-placeholder-text',
          )}
        >
          {Math.round(day?.dailyMacros?.protein || 0)}P
        </div>

        <div
          className={cn(
            'text-center text-sm font-medium px-1 py-0.5 bg-card rounded-lg text-green-600',
            loading && 'masked-placeholder-text',
          )}
        >
          {Math.round(day?.dailyMacros?.carbs || 0)}C
        </div>
        <div
          className={cn(
            'text-center text-sm font-medium px-1 py-0.5 bg-card rounded-lg text-yellow-600',
            loading && 'masked-placeholder-text',
          )}
        >
          {Math.round(day?.dailyMacros?.fat || 0)}F
        </div>
      </div>
    </div>
  )
}
