import { ChefHat } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { MealHeaderInfo } from './meal-header-info'
import { NutritionSummary } from './nutrition-summary'
import { QuantityControls } from './quantity-controls'

interface FoodQuantity {
  id: string
  name: string
  originalQuantity: number
  loggedQuantity: number
  unit: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface MealLoggingDrawerProps {
  meal: {
    id: string
    name: string
    dateTime: string
    instructions?: string | null
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
  } | null
  open: boolean
  onClose: () => void
  onSave: (mealId: string, foodQuantities: FoodQuantity[]) => void
  isLoading?: boolean
}

export function MealLoggingDrawer({
  meal,
  open,
  onClose,
  onSave,
  isLoading = false,
}: MealLoggingDrawerProps) {
  const [foodQuantities, setFoodQuantities] = useState<FoodQuantity[]>([])

  // Initialize quantities when meal changes
  useEffect(() => {
    if (!meal) return

    // Get the most recent meal log for this meal (in case there are multiple)
    const userMealLog = meal.logs
      .filter((log) => log.items && log.items.length > 0)
      .sort((a, b) => {
        // Sort by completion date or use the one with items
        if (a.completedAt && b.completedAt) {
          return (
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
          )
        }
        return b.items.length - a.items.length
      })[0]

    // Create a map of logged items by food name (simpler approach)
    const loggedItems = new Map<string, number>()
    userMealLog?.items?.forEach((item) => {
      // Match by food name since they're in the same meal
      loggedItems.set(item.name, item.quantity)
    })

    const quantities = meal.foods.map((food) => {
      const loggedQuantity = loggedItems.get(food.name) || food.quantity

      return {
        id: food.id,
        name: food.name,
        originalQuantity: food.quantity,
        loggedQuantity,
        unit: food.unit,
        totalCalories: food.totalCalories,
        totalProtein: food.totalProtein,
        totalCarbs: food.totalCarbs,
        totalFat: food.totalFat,
      }
    })

    setFoodQuantities(quantities)
  }, [meal])

  const updateQuantity = (foodId: string, newQuantity: number) => {
    setFoodQuantities((prev) =>
      prev.map((food) =>
        food.id === foodId
          ? { ...food, loggedQuantity: Math.max(0, newQuantity) }
          : food,
      ),
    )
  }

  const handleSave = () => {
    if (meal) {
      onSave(meal.id, foodQuantities)
    }
  }

  const totalLoggedCalories = foodQuantities.reduce((sum, food) => {
    const ratio = food.loggedQuantity / food.originalQuantity
    return sum + food.totalCalories * ratio
  }, 0)

  const totalLoggedProtein = foodQuantities.reduce((sum, food) => {
    const ratio = food.loggedQuantity / food.originalQuantity
    return sum + food.totalProtein * ratio
  }, 0)

  const totalLoggedCarbs = foodQuantities.reduce((sum, food) => {
    const ratio = food.loggedQuantity / food.originalQuantity
    return sum + food.totalCarbs * ratio
  }, 0)

  const totalLoggedFat = foodQuantities.reduce((sum, food) => {
    const ratio = food.loggedQuantity / food.originalQuantity
    return sum + food.totalFat * ratio
  }, 0)

  if (!meal) return null

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <SimpleDrawerContent
        title={`Log ${meal.name}`}
        headerIcon={<ChefHat className="size-5" />}
        footer={
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                Save Log
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Meal Info */}
          <MealHeaderInfo
            name={meal.name}
            dateTime={meal.dateTime}
            totalCalories={totalLoggedCalories}
            totalProtein={totalLoggedProtein}
            totalCarbs={totalLoggedCarbs}
            totalFat={totalLoggedFat}
          />

          {meal.instructions && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Instructions:</strong> {meal.instructions}
              </p>
            </div>
          )}

          {/* Food Items */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Adjust portions</Label>
            {foodQuantities.map((food, index) => {
              const ratio = food.loggedQuantity / food.originalQuantity
              const adjustedCalories = food.totalCalories * ratio
              const isQuantityChanged =
                food.loggedQuantity !== food.originalQuantity

              return (
                <div key={food.id}>
                  {index > 0 && <Separator />}
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Planned: {food.originalQuantity} {food.unit}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p
                          className={cn(
                            'font-medium',
                            isQuantityChanged &&
                              'text-orange-600 dark:text-orange-400',
                          )}
                        >
                          {Math.round(adjustedCalories)} cal
                        </p>
                        <NutritionSummary
                          protein={food.totalProtein * ratio}
                          carbs={food.totalCarbs * ratio}
                          fat={food.totalFat * ratio}
                        />
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`quantity-${food.id}`}
                        className="text-sm w-16"
                      >
                        Actual:
                      </Label>
                      <QuantityControls
                        id={`quantity-${food.id}`}
                        value={food.loggedQuantity}
                        unit={food.unit}
                        onChange={(value) => updateQuantity(food.id, value)}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
