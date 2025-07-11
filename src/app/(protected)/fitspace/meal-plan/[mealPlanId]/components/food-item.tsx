import { ChevronRight } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { FoodNutritionInfo } from './food-nutrition-info'

interface FoodItemProps {
  food: {
    id: string
    name: string
    quantity: number
    unit: string
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  }
  showSeparator?: boolean
  isLogged?: boolean
  loggedQuantity?: number
  onClick?: () => void
}

export function FoodItem({
  food,
  showSeparator = false,
  isLogged = false,
  loggedQuantity,
  onClick,
}: FoodItemProps) {
  const displayedQuantity = isLogged
    ? loggedQuantity || food.quantity
    : food.quantity
  const isQuantityDifferent = isLogged && loggedQuantity !== food.quantity

  // Calculate adjusted nutrition values when logged quantity differs
  const nutritionRatio =
    isLogged && loggedQuantity ? loggedQuantity / food.quantity : 1

  const displayedCalories = Math.round(food.totalCalories * nutritionRatio)
  const displayedProtein = Math.round(food.totalProtein * nutritionRatio)
  const displayedCarbs = Math.round(food.totalCarbs * nutritionRatio)
  const displayedFat = Math.round(food.totalFat * nutritionRatio)

  return (
    <div>
      {showSeparator && <Separator />}
      <div
        className={cn(
          'flex items-center gap-3 py-2 transition-colors bg-card-on-card rounded-md px-2 cursor-pointer hover:bg-muted/50',
        )}
        onClick={onClick}
      >
        {/* Food Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className={cn('font-medium truncate')}>{food.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {displayedQuantity} {food.unit}
            </span>

            {/* Show planned vs actual */}
            {isQuantityDifferent && (
              <span className="text-xs text-muted-foreground">
                (planned: {food.quantity} {food.unit})
              </span>
            )}
          </div>
        </div>

        {/* Nutrition Info */}
        <FoodNutritionInfo
          calories={displayedCalories}
          protein={displayedProtein}
          carbs={displayedCarbs}
          fat={displayedFat}
          isLogged={isLogged}
        />

        {/* Arrow indicating clickable */}
        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      </div>
    </div>
  )
}
