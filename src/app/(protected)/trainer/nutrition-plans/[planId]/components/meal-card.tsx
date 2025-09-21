'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChefHat, Clock, Edit, Eye, EyeOff, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  type GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useRemoveMealFromNutritionPlanDayMutation,
} from '@/generated/graphql-client'

import { IngredientList } from './ingredient-list'

interface MealCardProps {
  planMeal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]
  nutritionPlanId: string
  dayId: string
}

export function MealCard({ planMeal, nutritionPlanId, dayId }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const meal = planMeal.meal
  const macros = planMeal.adjustedMacros

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
    onError: (err, variables, context) => {
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

  const handleEdit = () => {
    // TODO: Implement meal editing
    console.info('Edit meal:', meal.id)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteMealMutation.mutate({ planMealId: planMeal.id })
    setShowDeleteDialog(false)
    toast.success('Meal removed from day')
  }

  const formatTime = (minutes?: number | null) => {
    if (!minutes) return null
    return minutes < 60
      ? `${minutes}m`
      : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  const totalTime = (meal.preparationTime || 0) + (meal.cookingTime || 0)

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/20">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-4">
          {/* Recipe Title & Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold leading-tight">
                  {meal.name}
                </h3>
              </div>

              {meal.description && (
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {meal.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 ml-4">
              <Button size="sm" variant="ghost" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost">
                  {isExpanded ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Recipe Meta Info */}
          <div className="flex items-center gap-6 text-sm">
            {/* Timing */}
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

            {/* Servings */}
            {meal.servings && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {meal.servings} serving{meal.servings !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Portion multiplier */}
            {planMeal.portionMultiplier !== 1 && (
              <Badge variant="outline" className="text-xs">
                {planMeal.portionMultiplier}x portion
              </Badge>
            )}
          </div>

          <Separator className="mt-3" />

          {/* Nutrition Info - Restaurant Menu Style */}
          <div className="grid grid-cols-4 gap-3 mt-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {Math.round(macros?.calories || 0)}
              </div>
              <div className="text-xs text-muted-foreground">calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {Math.round(macros?.protein || 0)}g
              </div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(macros?.carbs || 0)}g
              </div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {Math.round(macros?.fat || 0)}g
              </div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Cooking Instructions - Cookbook Style */}
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

            <Separator />

            {/* Ingredients List - Professional Style */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 rounded bg-primary/20" />
                <h4 className="font-semibold">Ingredients</h4>
              </div>
              <IngredientList
                ingredients={meal.ingredients || []}
                portionMultiplier={planMeal.portionMultiplier}
                mealId={meal.id}
                onIngredientAdded={() => {
                  // TODO: Invalidate queries to refresh meal data
                  console.info('Ingredient added to meal:', meal.id)
                }}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dialogTitle="Delete Meal">
          <DialogHeader>
            <DialogTitle>Delete Meal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{meal.name}" from this day? This
              action cannot be undone.
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
              {deleteMealMutation.isPending ? 'Deleting...' : 'Delete Meal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
