import { format } from 'date-fns'
import { Edit3Icon, FlameIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { FoodItem } from './food-item'
import { useMealLogging } from './use-meal-logging'

export interface MealCardProps {
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

export function MealCard({ meal, onClick, onAddCustomFood }: MealCardProps) {
  const { handleRemoveLogItem } = useMealLogging()
  const [removingFoodId, setRemovingFoodId] = useState<string | null>(null)
  // Check if meal is completed - if any food has been logged
  const isCompleted = Boolean(meal.completedAt)

  const plannedFoods = meal.foods.filter((food) => !food.isCustomAddition)
  const customFoods = meal.foods.filter((food) => food.isCustomAddition)
  const loggedTotals = calculateLoggedTotals(meal.foods)

  return (
    <div className="grid grid-cols-[1fr_50px] gap-2">
      <div>
        <div className="flex items-center gap-2 justify-between">
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon-xs"
              iconOnly={<Edit3Icon />}
              onClick={() => onClick?.()}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              iconOnly={<PlusIcon />}
              onClick={onAddCustomFood}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {plannedFoods.map((food) => (
            <FoodItem key={food.id} food={food} onClick={() => onClick?.()} />
          ))}
          {customFoods.map((food) => (
            <FoodItem key={food.id} food={food} onClick={() => onClick?.()} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="rounded-full font-mono">
          {format(new Date(meal.dateTime), 'HH:mm')}
        </Badge>
        {[...plannedFoods, ...customFoods].map((food) => (
          <div
            key={food.id}
            className="flex items-center justify-center h-[56px]"
          >
            {food.isCustomAddition && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground"
                iconOnly={<XIcon />}
                loading={removingFoodId === food.id}
                onClick={async () => {
                  try {
                    setRemovingFoodId(food.id)
                    await handleRemoveLogItem(food.id)
                  } catch (error) {
                    console.error(error)
                  } finally {
                    setRemovingFoodId(null)
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
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
    <div className="flex gap-2">
      <p className="text-sm font-medium flex items-center text-primary">
        {Math.round(totalsToShow.calories)}
        <FlameIcon className="size-3" />
      </p>
      <p className="text-sm font-medium text-green-600">
        {Math.round(totalsToShow.protein)}P
      </p>
      <p className="text-sm font-medium text-blue-600">
        {Math.round(totalsToShow.carbs)}C
      </p>
      <p className="text-sm font-medium text-yellow-600">
        {Math.round(totalsToShow.fat)}F
      </p>
      {/* <MacroBadge macro="calories" value={Math.round(totalsToShow.calories)} />
      <MacroBadge macro="protein" value={Math.round(totalsToShow.protein)} />
      <MacroBadge macro="carbs" value={Math.round(totalsToShow.carbs)} />
      <MacroBadge macro="fat" value={Math.round(totalsToShow.fat)} /> */}
    </div>
  )
}
