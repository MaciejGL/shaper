import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMealPlanContext } from '@/context/meal-plan-context/meal-plan-context'
import { cn } from '@/lib/utils'

import { AddFoodDrawer } from './add-food-drawer'
import { MacroBadge } from './macro-badge'
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
        <Card
          key={hour}
          className={cn(
            'bg-card dark:bg-muted/30 group/meal-card cursor-pointer transition-all shadow-xs',
            !hasFood && 'bg-card/50 dark:bg-muted/15',
          )}
          onClick={() => handleOpenMeal(hour)}
        >
          <CardContent>
            {hasFood ? (
              <div className="space-y-1 flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <div className="text-xs flex gap-2">
                    <MacroBadge
                      macro="calories"
                      value={mealNutrients?.calories ?? 0}
                    />
                    <MacroBadge
                      macro="protein"
                      value={mealNutrients?.protein ?? 0}
                    />
                    <MacroBadge
                      macro="carbs"
                      value={mealNutrients?.carbs ?? 0}
                    />
                    <MacroBadge macro="fat" value={mealNutrients?.fat ?? 0} />
                  </div>
                  <Button
                    iconOnly={<PlusIcon />}
                    variant="ghost"
                    size="icon-sm"
                    className="group-hover/meal-card:opacity-100 opacity-0"
                  />
                </div>
                <div className="pt-2 space-y-1.5 w-full">
                  {meal.foods.map((food) => (
                    <div
                      key={food.id}
                      className="flex flex-col px-3 py-2 gap-2 rounded-md bg-card-on-card w-full shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-md font-medium">{food.name}</p>

                        <p className="text-xs text-muted-foreground">
                          {food.quantity} {food.unit}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        <MacroBadge
                          macro="calories"
                          size="sm"
                          value={food.caloriesPer100g ?? 0}
                        />
                        <MacroBadge
                          macro="protein"
                          size="sm"
                          value={food.proteinPer100g ?? 0}
                        />
                        <MacroBadge
                          macro="carbs"
                          size="sm"
                          value={food.carbsPer100g ?? 0}
                        />
                        <MacroBadge
                          macro="fat"
                          size="sm"
                          value={food.fatPer100g ?? 0}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/0 group-hover/meal-card:text-muted-foreground flex items-center justify-center transition-all">
                <PlusIcon className="w-4 h-4" />
              </div>
            )}
          </CardContent>
        </Card>
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
