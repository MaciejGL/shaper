import { FlameIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { MealTotals } from '@/app/(protected)/fitspace/meal-plan/components/meal-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { useMealPlanContext } from '@/context/meal-plan-context/meal-plan-context'
import { cn, formatNumber } from '@/lib/utils'

import { AddFoodDrawer } from './add-food-drawer'
import { Day } from './meal-time-slots'
import { formatHour } from './utils'

type MealSlotProps = {
  hour: number
  day: Day
}

export function MealSlot({ hour, day }: MealSlotProps) {
  const { getMealByHour } = useMealPlanContext()
  const meal = getMealByHour(day.id, hour)
  const hasFood = meal && meal.foods.length > 0
  const [selectedHour, setSelectedHour] = useState<number | null>(null)

  const mealNutrients = meal?.foods.reduce(
    (acc, food) => {
      return {
        calories:
          acc.calories + ((food.caloriesPer100g || 0) * food.quantity) / 100,
        protein:
          acc.protein + ((food.proteinPer100g || 0) * food.quantity) / 100,
        carbs: acc.carbs + ((food.carbsPer100g || 0) * food.quantity) / 100,
        fat: acc.fat + ((food.fatPer100g || 0) * food.quantity) / 100,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const handleCloseSheet = () => {
    setSelectedHour(null)
  }

  const handleOpenMeal = (hour: number) => {
    setSelectedHour(hour)
  }

  return (
    <>
      <div
        className="grid grid-cols-[1fr_60px] justify-between items-start gap-2"
        key={hour}
      >
        <div
          key={hour}
          className={cn('group/meal-card cursor-pointer transition-all')}
          onClick={() => handleOpenMeal(hour)}
        >
          <CardContent>
            {hasFood ? (
              <div className="space-y-1 flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <MealTotals
                    plannedTotals={{
                      calories: mealNutrients?.calories ?? 0,
                      protein: mealNutrients?.protein ?? 0,
                      carbs: mealNutrients?.carbs ?? 0,
                      fat: mealNutrients?.fat ?? 0,
                    }}
                    hasLogs={false}
                  />

                  <Button
                    iconOnly={<PlusIcon />}
                    variant="ghost"
                    size="icon-sm"
                    className="group-hover/meal-card:opacity-100 opacity-0"
                  />
                </div>
                <div className="space-y-1.5 w-full">
                  {meal.foods.map((food) => (
                    <div
                      key={food.id}
                      className="bg-card p-2 rounded-lg space-y-1 h-[56px] overflow-hidden"
                    >
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium truncate min-w-0 flex-1 text-left">
                          {food.name}
                        </p>
                        <p className="text-xs shrink-0 whitespace-nowrap">
                          {food.quantity} {food.unit}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          {formatNumber(
                            Math.round(
                              ((food.caloriesPer100g ?? 0) * food.quantity) /
                                100,
                            ),
                          )}
                          <FlameIcon className="size-2.5" />
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(
                            Math.round(
                              ((food.proteinPer100g ?? 0) * food.quantity) /
                                100,
                            ),
                          )}
                          P
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(
                            Math.round(
                              ((food.carbsPer100g ?? 0) * food.quantity) / 100,
                            ),
                          )}
                          C
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(
                            Math.round(
                              ((food.fatPer100g ?? 0) * food.quantity) / 100,
                            ),
                          )}
                          F
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/0 group-hover/meal-card:text-muted-foreground flex items-center justify-center transition-all h-[56px] bg-card/50 rounded-lg">
                <PlusIcon className="w-4 h-4" />
              </div>
            )}
          </CardContent>
        </div>
        <div className="flex items-start justify-end w-20">
          <Badge
            variant="tertiary"
            className={cn(
              'w-full',
              !hasFood && '!bg-card/40 dark:!bg-muted/30',
            )}
          >
            {formatHour(hour)}
          </Badge>
        </div>
      </div>
      {selectedHour && (
        <AddFoodDrawer
          selectedHour={selectedHour}
          dayId={day.id}
          handleCloseSheet={handleCloseSheet}
        />
      )}
    </>
  )
}
