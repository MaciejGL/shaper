import { FlameIcon, Plus, ShoppingCart, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SearchResult } from '@/lib/food-search'

import { MealTotals } from './meal-card'
import { QuantityControls } from './quantity-controls'

// Component to show scanned food result inline
export function ScannedFoodResult({
  foodItem,
  onAddToMeal,
  onRemove,
}: {
  foodItem: SearchResult
  onAddToMeal: (food: SearchResult, quantity: number) => Promise<void>
  onRemove: () => void
}) {
  const [quantity, setQuantity] = useState(100)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToMeal = async () => {
    setIsAdding(true)
    try {
      await onAddToMeal(foodItem, quantity)
    } catch (error) {
      console.error('Error adding food to meal:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Calculate nutrition based on selected quantity
  const ratio = quantity / 100
  const adjustedCalories = Math.round((foodItem.caloriesPer100g || 0) * ratio)
  const adjustedProtein = Math.round((foodItem.proteinPer100g || 0) * ratio)
  const adjustedCarbs = Math.round((foodItem.carbsPer100g || 0) * ratio)
  const adjustedFat = Math.round((foodItem.fatPer100g || 0) * ratio)

  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ShoppingCart className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold">{foodItem.name}</h3>
              <p className="text-sm text-muted-foreground">
                Scanned from barcode
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground"
            iconOnly={<XIcon />}
          />
        </div>

        {/* Nutrition per 100g */}
        <div className="bg-card rounded-lg p-3 flex flex-row items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            Nutrition per 100g:
          </h4>
          <MealTotals
            plannedTotals={{
              calories: foodItem.caloriesPer100g || 0,
              protein: foodItem.proteinPer100g || 0,
              carbs: foodItem.carbsPer100g || 0,
              fat: foodItem.fatPer100g || 0,
            }}
            hasLogs={false}
          />
        </div>

        {/* Quantity Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quantity</h4>
          <div className="flex justify-center">
            <QuantityControls
              id="scanned-food-quantity"
              value={quantity}
              unit="g"
              onChange={setQuantity}
              min={1}
              step={10}
            />
          </div>
        </div>

        {/* Adjusted Nutrition */}
        <div className="p-3 rounded-lg bg-card">
          <h4 className="text-sm font-medium mb-2">
            Nutrition for {quantity}g:
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FlameIcon className="size-4 text-orange-500" />
              <span className="font-medium">{adjustedCalories}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-500" />
              <span className="font-medium">{adjustedProtein}g</span>
              <span className="text-muted-foreground">protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="font-medium">{adjustedCarbs}g</span>
              <span className="text-muted-foreground">carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-yellow-500" />
              <span className="font-medium">{adjustedFat}g</span>
              <span className="text-muted-foreground">fat</span>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAddToMeal}
          className="w-full"
          loading={isAdding}
          disabled={isAdding}
          iconStart={<Plus />}
        >
          Add to Meal
        </Button>
      </div>
    </Card>
  )
}
