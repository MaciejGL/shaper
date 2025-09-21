'use client'

import { useQueryClient } from '@tanstack/react-query'
import { DragControls } from 'framer-motion'
import { ChefHat, Grip, Minus, Plus, Salad, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  type GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useRemoveMealFromNutritionPlanDayMutation,
  useUpdateNutritionPlanMealPortionMutation,
} from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'

interface MealCardProps {
  planMeal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]
  nutritionPlanId: string
  dayId: string
  isDraggable?: boolean
  dragControls?: DragControls
}

export function MealCard({
  planMeal,
  nutritionPlanId,
  dayId,
  isDraggable = false,
  dragControls,
}: MealCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [portionInput, setPortionInput] = useState(
    planMeal.portionMultiplier.toString(),
  )
  const queryClient = useQueryClient()
  const meal = planMeal.meal
  const macros = planMeal.adjustedMacros

  // Debounce the portion input for mutations
  const debouncedPortionInput = useDebounce(portionInput, 500)

  // Track the last sent portion to prevent duplicate mutations
  const lastSentPortionRef = useRef(planMeal.portionMultiplier)

  const updatePortionMutation = useUpdateNutritionPlanMealPortionMutation({
    onSuccess: () => {
      // Refresh data to get updated values
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: unknown) => {
      toast.error('Failed to update portion: ' + (err as Error).message)
      // Reset to server state
      setPortionInput(planMeal.portionMultiplier.toString())
      lastSentPortionRef.current = planMeal.portionMultiplier
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Trigger debounced mutation when debouncedPortionInput changes
  useEffect(() => {
    const parsedPortion = parseFloat(debouncedPortionInput)
    if (isNaN(parsedPortion) || parsedPortion <= 0) return

    // Round to 1 decimal place to avoid floating point precision issues
    const roundedPortion = Math.round(parsedPortion * 10) / 10

    // Only mutate if the value is different from what we last sent
    if (roundedPortion !== lastSentPortionRef.current) {
      lastSentPortionRef.current = roundedPortion
      updatePortionMutation.mutate({
        input: {
          planMealId: planMeal.id,
          portionMultiplier: roundedPortion,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPortionInput, planMeal.id])

  const deleteMealMutation = useRemoveMealFromNutritionPlanDayMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI by removing the meal
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetNutritionPlanQuery | undefined) => {
          if (!old?.nutritionPlan?.days) return old
          return {
            ...old,
            nutritionPlan: {
              ...old.nutritionPlan,
              days: old.nutritionPlan.days.map((day) => {
                if (day.id === dayId) {
                  return {
                    ...day,
                    meals:
                      day.meals?.filter((meal) => meal.id !== planMeal.id) ||
                      [],
                  }
                }
                return day
              }),
            },
          }
        },
      )

      return { previousData, queryKey }
    },
    onError: (err: unknown, variables: unknown, context) => {
      toast.error('Failed to delete meal: ' + (err as Error).message)
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handlePortionChange = useCallback((newPortion: number) => {
    if (newPortion <= 0) return
    // Round to 1 decimal place to avoid floating point precision issues
    const roundedPortion = Math.round(newPortion * 10) / 10
    setPortionInput(roundedPortion.toString())
  }, [])

  const handlePortionInputChange = useCallback((value: string) => {
    setPortionInput(value)
  }, [])

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteMealMutation.mutate({ planMealId: planMeal.id })
    setShowDeleteDialog(false)
    toast.success('Meal removed from nutrition plan')
  }

  // Handle drag start with proper event prevention
  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault() // Prevent default browser behavior
    if (dragControls) {
      dragControls.start(e)
    }
  }

  return (
    <>
      <div className="flex gap-2 items-start">
        {isDraggable && dragControls && (
          <div
            className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-manipulation select-none pt-[22px]"
            onPointerDown={handleDragStart}
            style={{
              touchAction: 'none', // Completely disable touch actions on drag handle
              userSelect: 'none', // Prevent text selection
            }}
          >
            <Grip className="size-4" />
          </div>
        )}
        <Accordion type="single" collapsible className="flex-1">
          <AccordionItem
            value="meal-details"
            className="outline rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                {/* Left side: meal name and compact macros */}
                <div className="flex items-center gap-4">
                  <h3 className="text-base font-medium">{meal.name}</h3>

                  {/* Compact macros */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-md px-2 py-1">
                    <span className="font-medium text-primary">
                      {Math.round(macros?.calories || 0)} cal
                    </span>
                    <span>•</span>
                    <span className="text-green-600">
                      {Math.round(macros?.protein || 0)}p
                    </span>
                    <span className="text-blue-600">
                      {Math.round(macros?.carbs || 0)}c
                    </span>
                    <span className="text-yellow-600">
                      {Math.round(macros?.fat || 0)}f
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-6">
                {/* Meal description */}
                {meal.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {meal.description}
                  </p>
                )}

                {/* Portion adjustment section */}
                {/* Right side: portion control and actions */}
                <div className="flex items-center justify-end gap-3">
                  {/* Portion adjustment */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePortionChange(
                          Math.max(0.1, parseFloat(portionInput) - 0.1),
                        )
                      }}
                      iconOnly={<Minus />}
                    />
                    <Input
                      id="portion-input"
                      value={portionInput}
                      onChange={(e) => {
                        e.stopPropagation()
                        handlePortionInputChange(e.target.value)
                      }}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => {
                        e.stopPropagation()
                        const parsed = parseFloat(portionInput)
                        if (isNaN(parsed) || parsed <= 0) {
                          setPortionInput(planMeal.portionMultiplier.toString())
                        } else {
                          // Round to 1 decimal place for consistency
                          const rounded = Math.round(parsed * 10) / 10
                          setPortionInput(rounded.toString())
                        }
                      }}
                      className="w-4 h-6 text-xs text-right border-0 bg-transparent p-0"
                    />
                    <span className="text-xs text-muted-foreground">x</span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePortionChange(parseFloat(portionInput) + 0.1)
                      }}
                      iconOnly={<Plus />}
                    />
                  </div>

                  {/* Delete button */}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    iconOnly={<Trash2 />}
                  />
                </div>
                {/* Detailed nutrition info */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center bg-muted/30 rounded-lg p-2">
                    <div className="text-lg font-semibold text-primary">
                      {Math.round(macros?.calories || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      calories
                    </div>
                  </div>
                  <div className="text-center bg-muted/30 rounded-lg p-2">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round(macros?.protein || 0)}g
                    </div>
                    <div className="text-xs text-muted-foreground">protein</div>
                  </div>
                  <div className="text-center bg-muted/30 rounded-lg p-2">
                    <div className="text-lg font-semibold text-blue-600">
                      {Math.round(macros?.carbs || 0)}g
                    </div>
                    <div className="text-xs text-muted-foreground">carbs</div>
                  </div>
                  <div className="text-center bg-muted/30 rounded-lg p-2">
                    <div className="text-lg font-semibold text-yellow-600">
                      {Math.round(macros?.fat || 0)}g
                    </div>
                    <div className="text-xs text-muted-foreground">fat</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Ingredients List - Read-only */}
                  <div className="">
                    <div className="flex items-center gap-2 mb-3">
                      <Salad className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Ingredients</h4>
                    </div>
                    {meal.ingredients && meal.ingredients.length > 0 ? (
                      <div className="space-y-2">
                        {meal.ingredients.map((mealIngredient) => {
                          const ingredient = mealIngredient.ingredient
                          const adjustedGrams =
                            mealIngredient.grams * planMeal.portionMultiplier

                          // Calculate macros based on adjusted grams
                          const calories = Math.round(
                            (ingredient.caloriesPer100g * adjustedGrams) / 100,
                          )
                          const protein = Math.round(
                            (ingredient.proteinPer100g * adjustedGrams) / 100,
                          )
                          const carbs = Math.round(
                            (ingredient.carbsPer100g * adjustedGrams) / 100,
                          )
                          const fat = Math.round(
                            (ingredient.fatPer100g * adjustedGrams) / 100,
                          )

                          return (
                            <div
                              key={mealIngredient.id}
                              className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {ingredient.name}
                                </span>
                                <div className="text-sm text-muted-foreground">
                                  {adjustedGrams}g
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm ml-auto">
                                <span>{calories} kcal</span>
                                <span className="text-green-600">
                                  P: {protein}g
                                </span>
                                <span className="text-blue-600">
                                  C: {carbs}g
                                </span>
                                <span className="text-yellow-600">
                                  F: {fat}g
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No ingredients in this meal
                      </div>
                    )}
                  </div>
                  {/* Cooking Instructions */}
                  {meal.instructions && meal.instructions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ChefHat className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">Cooking Instructions</h4>
                      </div>
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
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Remove from plan confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dialogTitle="Remove Meal">
          <DialogHeader>
            <DialogTitle>Remove Meal from Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{meal.name}" from this nutrition
              plan day? The meal will remain in your meal library and can be
              added to other plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMealMutation.isPending}
            >
              {deleteMealMutation.isPending
                ? 'Removing...'
                : 'Remove from Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
