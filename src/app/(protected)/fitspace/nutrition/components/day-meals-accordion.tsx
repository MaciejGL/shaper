'use client'

import { ChefHat } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'

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
    <>
      <CardHeader className="mb-0 px-0">
        <DayMealsHeader day={day} />
      </CardHeader>
      <CardContent className="px-0">
        <Accordion type="multiple" className="space-y-2">
          {meals
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((planMeal, index) => {
              const meal = planMeal.meal
              const macros = planMeal.adjustedMacros

              return (
                <AccordionItem
                  key={planMeal.id}
                  value={planMeal.id}
                  className="rounded-2xl dark:bg-card-on-card dark:border-none border last:border-b"
                >
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-left">{`${meal.name}`}</span>
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
                        <div className="grid grid-cols-4 mt-2">
                          <div className="text-center p-2 border-r border-border/50">
                            <div className="text-sm font-semibold text-primary">
                              {Math.round(macros?.calories || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              calories
                            </div>
                          </div>
                          <div className="text-center p-2 border-r border-border/50">
                            <div className="text-sm font-semibold text-green-600">
                              {Math.round(macros?.protein || 0)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              protein
                            </div>
                          </div>
                          <div className="text-center p-2 border-r border-border/50">
                            <div className="text-sm font-semibold text-blue-600">
                              {Math.round(macros?.carbs || 0)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              carbs
                            </div>
                          </div>
                          <div className="text-center p-2">
                            <div className="text-sm font-semibold text-yellow-600">
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
                        <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                          Ingredients
                        </h4>
                        {meal.ingredients && meal.ingredients.length > 0 ? (
                          <div className="space-y-2">
                            {meal.ingredients
                              .sort((a, b) => a.order - b.order)
                              .map((ingredientItem) => {
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
                                    className="flex items-center gap-1 py-1 text-muted-foreground"
                                  >
                                    {/* <Dot size={16} className="text-foreground" /> */}

                                    <span>
                                      {ingredientItem.ingredient.name}
                                    </span>
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
                            <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                              Directions
                            </h4>
                            <div className="space-y-3">
                              {meal.instructions.map((instruction, index) => (
                                <div key={index} className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    Step {index + 1}
                                  </span>
                                  <p className="text-sm leading-relaxed text-muted-foreground">
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
      </CardContent>
    </>
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
    <div className="grid grid-cols-[auto_auto_auto_auto] gap-1 w-max mb-2">
      <Badge variant="primary" isLoading={loading} size="lg">
        {Math.round(day?.dailyMacros?.calories || 0)} cal
      </Badge>
      <Badge variant="info" isLoading={loading} size="lg">
        {Math.round(day?.dailyMacros?.protein || 0)} P
      </Badge>

      <Badge variant="success" isLoading={loading} size="lg">
        {Math.round(day?.dailyMacros?.carbs || 0)} C
      </Badge>
      <Badge variant="warning" isLoading={loading} size="lg">
        {Math.round(day?.dailyMacros?.fat || 0)} F
      </Badge>
    </div>
  )
}
