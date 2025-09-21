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

type PlanMeal = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]['meals'][number]

interface DayMealsAccordionProps {
  meals: PlanMeal[]
}

export function DayMealsAccordion({ meals }: DayMealsAccordionProps) {
  const { formatIngredient } = useCookingUnits()

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No meals planned for this day</p>
      </div>
    )
  }

  //   const formatTime = (minutes?: number | null) => {
  //     if (!minutes) return null
  //     return minutes < 60
  //       ? `${minutes}m`
  //       : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  //   }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <SectionIcon icon={ChefHat} size="xs" variant="amber" />
        Menu
      </div>
      <Accordion type="single" collapsible className="space-y-2">
        {meals
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((planMeal) => {
            const meal = planMeal.meal
            const macros = planMeal.adjustedMacros
            //   const totalTime =
            //     (meal.preparationTime || 0) + (meal.cookingTime || 0)

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

                    {/* Meal Meta Info */}
                    {/* <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-4">
                      {meal.preparationTime && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Prep {formatTime(meal.preparationTime)}</span>
                        </div>
                      )}
                      {meal.cookingTime && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Cook {formatTime(meal.cookingTime)}</span>
                        </div>
                      )}
                      {totalTime > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Total {formatTime(totalTime)}
                        </Badge>
                      )}
                    </div>

                    {meal.servings && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {meal.servings} serving
                          {meal.servings !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div> */}

                    {/* <Separator /> */}

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
                              const adjustedGrams =
                                ingredientItem.grams *
                                planMeal.portionMultiplier
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
