import { format } from 'date-fns'
import { CheckCircle, Circle } from 'lucide-react'

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
    }[]
    logs: {
      id: string
      completedAt?: string | null
      items: {
        id: string
        name: string
        quantity: number
        calories?: number | null
        protein?: number | null
        carbs?: number | null
        fat?: number | null
      }[]
    }[]
  }
  onClick?: () => void
  onCompleteMeal?: (mealId: string) => void
  onUncompleteMeal?: (mealId: string) => void
}

export function MealCard({
  meal,
  onClick,
  onCompleteMeal,
  onUncompleteMeal,
}: MealCardProps) {
  // Get user's meal log for this meal
  const userMealLog = meal.logs.find((log) => log.items && log.items.length > 0)
  const isCompleted = userMealLog?.completedAt

  // Create a map of logged items by food name (simpler approach)
  const loggedItems = new Map(
    userMealLog?.items?.map((item) => [
      item.name,
      {
        quantity: item.quantity,
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0,
      },
    ]) || [],
  )

  const mealTotals = meal.foods.reduce(
    (totals, food) => ({
      calories: totals.calories + food.totalCalories,
      protein: totals.protein + food.totalProtein,
      carbs: totals.carbs + food.totalCarbs,
      fat: totals.fat + food.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const loggedTotals = userMealLog?.items.reduce(
    (totals, item) => ({
      calories: totals.calories + (item.calories || 0),
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fat: totals.fat + (item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 }

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
      className={cn(
        'transition-all cursor-pointer hover:shadow-md',
        isCompleted &&
          'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
      )}
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
          </div>
        </div>
        {meal.instructions && (
          <p className="text-sm text-muted-foreground">{meal.instructions}</p>
        )}
      </CardHeader>
      <CardContent>
        {meal.foods.length > 0 ? (
          <div className="space-y-1">
            {meal.foods.map((food) => {
              const loggedData = loggedItems.get(food.name)
              const isLogged = !!loggedData

              return (
                <FoodItem
                  key={food.id}
                  food={food}
                  isLogged={isLogged}
                  loggedQuantity={loggedData?.quantity}
                  onClick={onClick}
                />
              )
            })}

            {/* Meal Totals */}
            <Separator className="my-4" />
            <div className="flex items-center justify-end gap-2">
              <MealTotals
                loggedTotals={loggedTotals}
                mealTotals={mealTotals}
                userMealLog={userMealLog}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No foods planned for this meal
          </p>
        )}
      </CardContent>
    </Card>
  )
}
function MealTotals({
  loggedTotals,
  mealTotals,
  userMealLog,
}: {
  loggedTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  mealTotals: { calories: number; protein: number; carbs: number; fat: number }
  userMealLog?: MealCardProps['meal']['logs'][number]
}) {
  const hasAnyLogs = userMealLog?.items && userMealLog.items.length > 0
  return (
    <div className="flex items-center gap-2">
      {hasAnyLogs ? (
        <>
          <MacroBadge
            macro="calories"
            value={Math.round(loggedTotals.calories)}
          />
          <MacroBadge
            macro="protein"
            value={Math.round(loggedTotals.protein)}
          />
          <MacroBadge macro="carbs" value={Math.round(loggedTotals.carbs)} />
          <MacroBadge macro="fat" value={Math.round(loggedTotals.fat)} />
        </>
      ) : (
        <>
          <MacroBadge
            macro="calories"
            value={Math.round(mealTotals.calories)}
          />
          <MacroBadge macro="protein" value={Math.round(mealTotals.protein)} />
          <MacroBadge macro="carbs" value={Math.round(mealTotals.carbs)} />
          <MacroBadge macro="fat" value={Math.round(mealTotals.fat)} />
        </>
      )}
    </div>
  )
}
