'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMealPlanContext } from '@/context/meal-plan-context/meal-plan-context'
import { GQLGetMealPlanByIdQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import FoodSearch from './food-search'

type Day = GQLGetMealPlanByIdQuery['getMealPlanById']['weeks'][0]['days'][0]

interface MealTimeSlotsProps {
  day: Day
}

export default function MealTimeSlots({ day }: MealTimeSlotsProps) {
  const { getMealByHour } = useMealPlanContext()
  const [selectedHour, setSelectedHour] = useState<number | null>(null)

  const hours = Array.from({ length: 17 }, (_, i) => i + 7) // 7 AM to 11 PM

  const handleCloseSheet = () => {
    setSelectedHour(null)
  }

  const handleOpenMeal = (hour: number) => {
    setSelectedHour(hour)
  }

  const getMealForHour = (hour: number) => {
    return getMealByHour(day.id, hour)
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour < 12) return `${hour} AM`
    return `${hour - 12} PM`
  }

  return (
    <div className="space-y-4">
      {hours.map((hour) => {
        const meal = getMealForHour(hour)
        const hasFood = meal && meal.foods.length > 0

        const mealNutrients = meal?.foods.reduce(
          (acc, food) => {
            return {
              calories:
                acc.calories +
                ((food.caloriesPer100g || 0) * food.quantity) / 100,
              protein:
                acc.protein +
                ((food.proteinPer100g || 0) * food.quantity) / 100,
              carbs:
                acc.carbs + ((food.carbsPer100g || 0) * food.quantity) / 100,
              fat: acc.fat + ((food.fatPer100g || 0) * food.quantity) / 100,
            }
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        )

        return (
          <div
            className="grid grid-cols-[1fr_60px] justify-between items-start gap-2"
            key={hour}
          >
            <Card
              key={hour}
              className={cn(
                'bg-muted/30 group/meal-card cursor-pointer transition-all hover:shadow-md',
                !hasFood && 'bg-muted/20',
              )}
              onClick={() => handleOpenMeal(hour)}
            >
              <CardContent>
                {hasFood ? (
                  <div className="space-y-1 flex flex-col w-full">
                    <div className="text-xs flex gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 text-primary-foreground rounded-md bg-primary/80">
                        {mealNutrients?.calories?.toFixed(0)}kcal
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20">
                        {mealNutrients?.protein?.toFixed(0)}P
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20">
                        {mealNutrients?.carbs?.toFixed(0)}C
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/20">
                        {mealNutrients?.fat?.toFixed(0)}F
                      </div>
                    </div>
                    <div className="pt-2 space-y-1 w-full">
                      {meal.foods.map((food) => (
                        <div
                          key={food.id}
                          className="flex flex-col px-2 py-1 rounded-md bg-card-on-card w-full"
                        >
                          <div className="flex justify-between">
                            <p>{food.name}</p>
                            <div className="text-primary">
                              {food.caloriesPer100g
                                ? (
                                    (food.caloriesPer100g * food.quantity) /
                                    100
                                  ).toFixed(0)
                                : 0}{' '}
                              kcal
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-xs text-muted-foreground">
                              {food.quantity} {food.unit}
                            </p>
                            <div className="flex gap-1">
                              <p className="text-sm text-muted-foreground">
                                {food.proteinPer100g
                                  ? (
                                      (food.proteinPer100g * food.quantity) /
                                      100
                                    ).toFixed(0)
                                  : 0}
                                P |{' '}
                                {food.carbsPer100g
                                  ? (
                                      (food.carbsPer100g * food.quantity) /
                                      100
                                    ).toFixed(0)
                                  : 0}
                                C |{' '}
                                {food.fatPer100g
                                  ? (
                                      (food.fatPer100g * food.quantity) /
                                      100
                                    ).toFixed(0)
                                  : 0}
                                F
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground/50 group-hover/meal-card:text-muted-foreground flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex items-center justify-end">
              <Badge variant="outline">{formatHour(hour)}</Badge>
            </div>
          </div>
        )
      })}

      {/* Food Search Sheet */}
      <Sheet open={selectedHour !== null} onOpenChange={handleCloseSheet}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Meal</SheetTitle>
            <SheetDescription>
              Add or edit foods for{' '}
              {selectedHour !== null ? formatHour(selectedHour) : ''}
            </SheetDescription>
          </SheetHeader>
          {selectedHour !== null && (
            <FoodSearch
              dayId={day.id}
              hour={selectedHour}
              onClose={handleCloseSheet}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
