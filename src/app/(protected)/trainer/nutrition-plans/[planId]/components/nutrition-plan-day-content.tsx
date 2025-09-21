'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChefHat, Plus, Trash } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
  useRemoveNutritionPlanDayMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { EditableDayName } from './editable-day-name'
import { MealCard } from './meal-card'
import { MealSearchSection } from './meal-search-section'

interface NutritionPlanDayContentProps {
  day: NonNullable<GQLGetNutritionPlanQuery['nutritionPlan']>['days'][number]
  nutritionPlanId: string
  onDayDeleted?: (
    deletedDay: NonNullable<
      GQLGetNutritionPlanQuery['nutritionPlan']
    >['days'][number],
  ) => void
}

export function NutritionPlanDayContent({
  day,
  nutritionPlanId,
  onDayDeleted,
}: NutritionPlanDayContentProps) {
  const meals = day.meals || []

  return (
    <div className="space-y-8">
      <DayMenuHeader
        day={day}
        nutritionPlanId={nutritionPlanId}
        onDayDeleted={onDayDeleted}
      />

      {/* Recipe Creation Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Add Recipes to Menu</h3>
        </div>
        <MealSearchSection dayId={day.id} nutritionPlanId={nutritionPlanId} />
      </div>

      {/* Restaurant Menu Style Layout */}
      <div className="space-y-6">
        {meals.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Today's Menu</h3>
            <Badge variant="secondary" className="ml-2">
              {meals.length} recipe{meals.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {meals.map((planMeal, index) => (
          <div key={planMeal.id}>
            {index > 0 && <Separator className="my-6" />}
            <MealCard
              planMeal={planMeal}
              nutritionPlanId={nutritionPlanId}
              dayId={day.id}
            />
          </div>
        ))}

        {meals.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">
                  Create Your Menu
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start building today's menu by searching for recipes or
                  creating custom ones
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DayMenuHeader({
  day,
  nutritionPlanId,
  onDayDeleted,
}: {
  day: NonNullable<GQLGetNutritionPlanQuery['nutritionPlan']>['days'][number]
  nutritionPlanId: string
  onDayDeleted?: (
    deletedDay: NonNullable<
      GQLGetNutritionPlanQuery['nutritionPlan']
    >['days'][number],
  ) => void
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()

  const totalCalories = day.dailyMacros?.calories || 0
  const totalProtein = day.dailyMacros?.protein || 0
  const totalCarbs = day.dailyMacros?.carbs || 0
  const totalFat = day.dailyMacros?.fat || 0

  const deleteDayMutation = useRemoveNutritionPlanDayMutation({
    onMutate: async () => {
      // Cancel outgoing refetches
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update UI by removing the day
      queryClient.setQueryData(
        queryKey,
        (old: GQLGetNutritionPlanQuery | undefined) => {
          if (!old?.nutritionPlan?.days) return old
          return {
            ...old,
            nutritionPlan: {
              ...old.nutritionPlan,
              days: old.nutritionPlan.days.filter((d) => d.id !== day.id),
            },
          }
        },
      )

      return { previousData, queryKey }
    },
    onError: (err, variables, context) => {
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

  const handleDeleteDay = () => {
    // Call the parent callback before mutation for immediate tab switching
    onDayDeleted?.(day)
    deleteDayMutation.mutate({ dayId: day.id })
    setShowDeleteDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <EditableDayName
          dayId={day.id}
          dayName={day.name}
          nutritionPlanId={nutritionPlanId}
        />

        {/* Delete day button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dialogTitle="Delete Day">
          <DialogHeader>
            <DialogTitle>Delete Day</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{day.name}"? This will remove all
              meals and recipes from this day. This action cannot be undone.
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
              onClick={handleDeleteDay}
              disabled={deleteDayMutation.isPending}
            >
              {deleteDayMutation.isPending ? 'Deleting...' : 'Delete Day'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Daily Nutrition Summary - Restaurant Menu Style */}

      <div className="grid grid-cols-4 gap-2">
        <MenuNutritionItem
          value={totalCalories}
          title="Total Calories"
          unit=""
        />
        <MenuNutritionItem value={totalProtein} title="Protein" unit="g" />
        <MenuNutritionItem value={totalCarbs} title="Carbs" unit="g" />
        <MenuNutritionItem value={totalFat} title="Fat" unit="g" />
      </div>
    </div>
  )
}

function MenuNutritionItem({
  value,
  title,
  unit,
}: {
  value: number
  title: string
  unit: string
}) {
  const getColor = (title: string) => {
    if (title.toLowerCase().includes('protein'))
      return 'text-green-600 dark:text-green-400'
    if (title.toLowerCase().includes('carb'))
      return 'text-blue-600 dark:text-blue-400'
    if (title.toLowerCase().includes('fat'))
      return 'text-yellow-600 dark:text-yellow-400'
    return 'text-primary'
  }

  return (
    <div className="text-center bg-card rounded-lg p-4">
      <div className={cn('text-xl font-medium mb-1', getColor(title))}>
        {Math.round(value)}
        {unit}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{title}</div>
    </div>
  )
}
