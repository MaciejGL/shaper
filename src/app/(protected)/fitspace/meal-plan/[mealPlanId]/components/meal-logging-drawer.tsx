import { ChefHat } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
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
  isCustomAddition: boolean
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

    // Include ALL foods (both planned foods and custom additions)
    const quantities = meal.foods.map((food) => {
      // Use logged quantity if available, otherwise use planned quantity
      const loggedQuantity = food.log?.loggedQuantity || food.quantity

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
        isCustomAddition: food.isCustomAddition,
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
            {foodQuantities.map((food) => {
              const ratio = food.loggedQuantity / food.originalQuantity
              const adjustedCalories = food.totalCalories * ratio
              const adjustedProtein = food.totalProtein * ratio
              const adjustedCarbs = food.totalCarbs * ratio
              const adjustedFat = food.totalFat * ratio

              return (
                <div
                  key={food.id}
                  className={cn('p-3 rounded-lg bg-card-on-card')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{food.name}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {food.isCustomAddition ? 'Custom' : 'Planned'}:{' '}
                        {food.originalQuantity}
                        {food.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(adjustedCalories)} cal
                      </div>
                      <NutritionSummary
                        protein={adjustedProtein}
                        carbs={adjustedCarbs}
                        fat={adjustedFat}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <QuantityControls
                      id={`quantity-${food.id}`}
                      value={food.loggedQuantity}
                      unit={food.unit}
                      onChange={(newQuantity: number) =>
                        updateQuantity(food.id, newQuantity)
                      }
                    />
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
