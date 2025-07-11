import { format } from 'date-fns'
import { CheckCircle, Circle, PlusIcon } from 'lucide-react'

import { MacroBadge } from '@/app/(protected)/trainer/meal-plans/creator/components/macro-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { FoodItem } from './food-item'

interface MealCardProps {
  meal: {
    id: string
    name: string
    dateTime: string
    instructions?: string | null
    completedAt?: string | null
    foods: {
      id: string
      name: string
      quantity: number
      unit: string
      totalCalories: number
      totalProtein: number
      totalCarbs: number
      totalFat: number
      isCustomAddition: boolean
      log?: {
        id: string
        loggedQuantity: number
        unit: string
        loggedAt: string
        notes?: string | null
        calories?: number | null
        protein?: number | null
        carbs?: number | null
        fat?: number | null
        fiber?: number | null
      } | null
    }[]
    plannedCalories: number
    plannedProtein: number
    plannedCarbs: number
    plannedFat: number
  }
  onClick?: () => void
  onAddCustomFood?: () => void
  onCompleteMeal?: (mealId: string) => void
  onUncompleteMeal?: (mealId: string) => void
}

// Helper function to calculate logged totals from foods array
function calculateLoggedTotals(foods: MealCardProps['meal']['foods']) {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  foods.forEach((food) => {
    const log = food.log

    if (food.isCustomAddition) {
      calories += food.totalCalories
      protein += food.totalProtein
      carbs += food.totalCarbs
      fat += food.totalFat
    } else {
      calories += log?.calories || food.totalCalories
      protein += log?.protein || food.totalProtein
      carbs += log?.carbs || food.totalCarbs
      fat += log?.fat || food.totalFat
    }
  })

  return {
    calories: Math.round(calories * 100) / 100,
    protein: Math.round(protein * 100) / 100,
    carbs: Math.round(carbs * 100) / 100,
    fat: Math.round(fat * 100) / 100,
  }
}

export function MealCard({
  meal,
  onClick,
  onAddCustomFood,
  onCompleteMeal,
  onUncompleteMeal,
}: MealCardProps) {
  // Check if meal is completed - if any food has been logged
  const isCompleted =
    Boolean(meal.foods.some((food) => food.log)) || Boolean(meal.completedAt)

  const plannedFoods = meal.foods.filter((food) => !food.isCustomAddition)
  const customFoods = meal.foods.filter((food) => food.isCustomAddition)
  const loggedTotals = calculateLoggedTotals(meal.foods)

  const handleCompleteMeal = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the drawer
    if (isCompleted && onUncompleteMeal) {
      onUncompleteMeal(meal.id)
    } else if (onCompleteMeal) {
      onCompleteMeal(meal.id)
    }
  }

  return (
    <Card
      className={cn('transition-all cursor-pointer hover:shadow-md')}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{meal.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {format(new Date(meal.dateTime), 'HH:mm')}
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCompleteMeal}
              iconOnly={isCompleted ? <CheckCircle /> : <Circle />}
              className={cn(
                '',
                isCompleted
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-green-600',
              )}
            />
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddCustomFood?.()
              }}
              iconOnly={<PlusIcon />}
            >
              Add Ingredient
            </Button>
          </div>
        </div>
        {meal.instructions && (
          <p className="text-sm text-muted-foreground">{meal.instructions}</p>
        )}
        <MealTotals
          plannedTotals={{
            calories: meal.plannedCalories,
            protein: meal.plannedProtein,
            carbs: meal.plannedCarbs,
            fat: meal.plannedFat,
          }}
          loggedTotals={loggedTotals}
          hasLogs={isCompleted}
        />
      </CardHeader>
      <CardContent>
        {meal.foods.length > 0 ? (
          <div className="space-y-3">
            {/* Planned Foods */}
            {plannedFoods.length > 0 && (
              <div className="space-y-1">
                {plannedFoods.map((food) => {
                  const isLogged = !!food.log

                  return (
                    <FoodItem
                      key={food.id}
                      food={food}
                      isLogged={isLogged}
                      loggedQuantity={food.log?.loggedQuantity}
                    />
                  )
                })}
              </div>
            )}

            {/* Custom Foods Added for Today */}
            {customFoods.length > 0 && (
              <div className="space-y-2">
                <Separator className="flex-1 my-3" />
                <div className="space-y-1">
                  {customFoods.map((customFood) => {
                    return (
                      <FoodItem
                        key={`custom-${customFood.id}`}
                        food={customFood}
                        isLogged={true}
                        loggedQuantity={
                          customFood.log?.loggedQuantity || customFood.quantity
                        }
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground mb-4">
              This meal has no foods planned yet.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onAddCustomFood?.()
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MealTotals({
  loggedTotals,
  plannedTotals,
  hasLogs,
}: {
  loggedTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  plannedTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  hasLogs: boolean
}) {
  const totalsToShow = hasLogs ? loggedTotals : plannedTotals

  return (
    <div className="flex flex-wrap gap-1 justify-center pt-2">
      <MacroBadge macro="calories" value={Math.round(totalsToShow.calories)} />
      <MacroBadge macro="protein" value={Math.round(totalsToShow.protein)} />
      <MacroBadge macro="carbs" value={Math.round(totalsToShow.carbs)} />
      <MacroBadge macro="fat" value={Math.round(totalsToShow.fat)} />
    </div>
  )
}
