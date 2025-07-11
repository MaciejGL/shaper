import { ChevronRight, PenSquareIcon, TrashIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { FoodNutritionInfo } from './food-nutrition-info'
import { useMealLogging } from './use-meal-logging'

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
    isCustomAddition?: boolean
  }
  showSeparator?: boolean
  isLogged?: boolean
  loggedQuantity?: number
}

export function FoodItem({
  food,
  showSeparator = false,
  isLogged = false,
  loggedQuantity,
}: FoodItemProps) {
  const { handleRemoveLogItem, isRemovingLogItem } = useMealLogging()
  const displayQuantity = loggedQuantity ?? food.quantity
  const hasQuantityChanged =
    loggedQuantity !== undefined && loggedQuantity !== food.quantity

  // Calculate nutrition based on the actual logged quantity
  const ratio = displayQuantity / food.quantity
  const adjustedCalories = food.totalCalories * ratio
  const adjustedProtein = food.totalProtein * ratio
  const adjustedCarbs = food.totalCarbs * ratio
  const adjustedFat = food.totalFat * ratio

  const handleRemoveFood = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleRemoveLogItem(food.id)
  }

  return (
    <div>
      {showSeparator && <Separator />}
      <div
        className={cn(
          'flex items-center gap-3 py-2 transition-colors bg-card-on-card rounded-md px-2 cursor-pointer hover:bg-muted/50',
        )}
      >
        {/* Food Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className={cn('font-medium truncate')}>{food.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {displayQuantity} {food.unit}
            </span>

            {/* Show planned vs actual */}
            {hasQuantityChanged && (
              <span className="text-xs text-muted-foreground">
                (planned: {food.quantity} {food.unit})
              </span>
            )}
          </div>
        </div>

        {/* Nutrition Info */}
        <FoodNutritionInfo
          calories={Math.round(adjustedCalories)}
          protein={Math.round(adjustedProtein)}
          carbs={Math.round(adjustedCarbs)}
          fat={Math.round(adjustedFat)}
          isLogged={isLogged}
        />

        <div className="flex items-center gap-2">
          {food.isCustomAddition && (
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={handleRemoveFood}
              iconOnly={<TrashIcon />}
              loading={isRemovingLogItem}
            />
          )}
        </div>
      </div>
    </div>
  )
}
