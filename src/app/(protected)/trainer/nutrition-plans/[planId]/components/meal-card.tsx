'use client'

import { useQueryClient } from '@tanstack/react-query'
import { DragControls } from 'framer-motion'
import { Grip } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  type GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useRemoveMealFromNutritionPlanDayMutation,
} from '@/generated/graphql-client'

import { CookingInstructions } from './meal-card/cooking-instructions'
import { EditableIngredientsList } from './meal-card/editable-ingredients-list'
import { MacrosSummary } from './meal-card/macros-summary'
import { MealActions } from './meal-card/meal-actions'
import { MealCardHeader } from './meal-card/meal-card-header'
import { MealDeleteDialog } from './meal-card/meal-delete-dialog'
import { useIngredientEditing } from './meal-card/use-ingredient-editing'

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
  const queryClient = useQueryClient()

  const meal = planMeal.meal
  const macros = planMeal.adjustedMacros

  // Use ingredient editing hook
  const { ingredientGrams, handleIngredientGramChange, formatIngredientValue } =
    useIngredientEditing({
      planMeal,
      nutritionPlanId,
      dayId,
    })

  // Delete meal mutation
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
            className="outline rounded-lg px-4 bg-card dark:outline-none"
          >
            <AccordionTrigger className="hover:no-underline">
              <MealCardHeader meal={meal} macros={macros} />
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-6">
                {/* Meal description */}
                {meal.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {meal.description}
                  </p>
                )}

                {/* Actions */}
                <MealActions onDelete={handleDelete} />

                {/* Detailed nutrition info */}
                <MacrosSummary macros={macros} />

                <div className="grid grid-cols-2 gap-4">
                  {/* Ingredients List - Editable */}
                  <EditableIngredientsList
                    meal={meal}
                    planMeal={planMeal}
                    ingredientGrams={ingredientGrams}
                    onIngredientChange={handleIngredientGramChange}
                    onIngredientFormat={formatIngredientValue}
                  />

                  {/* Cooking Instructions */}
                  <CookingInstructions instructions={meal.instructions} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Remove from plan confirmation dialog */}
      <MealDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        mealName={meal.name}
        onConfirm={confirmDelete}
        isDeleting={deleteMealMutation.isPending}
      />
    </>
  )
}
