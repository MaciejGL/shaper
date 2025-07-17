'use client'

import { FlameIcon, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { SearchResult } from '@/lib/food-search'

import { QuantityControls } from '../app/(protected)/fitspace/meal-plan/components/quantity-controls'
import { MacroBadge } from '../app/(protected)/trainer/meal-plans/creator/components/macro-badge'

interface FoodResultDrawerProps {
  isOpen: boolean
  onClose: () => void
  foodItem: SearchResult | null
  onAddToMeal: (food: SearchResult, quantity: number) => Promise<void>
}

export function FoodResultDrawer({
  isOpen,
  onClose,
  foodItem,
  onAddToMeal,
}: FoodResultDrawerProps) {
  const [quantity, setQuantity] = useState(100)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToMeal = async () => {
    if (!foodItem) return

    setIsAdding(true)
    try {
      await onAddToMeal(foodItem, quantity)
    } catch (error) {
      console.error('Error adding food to meal:', error)
    } finally {
      setIsAdding(false)
    }
  }

  if (!foodItem) return null

  // Calculate nutrition based on selected quantity
  const ratio = quantity / 100
  const adjustedCalories = Math.round((foodItem.caloriesPer100g || 0) * ratio)
  const adjustedProtein = Math.round((foodItem.proteinPer100g || 0) * ratio)
  const adjustedCarbs = Math.round((foodItem.carbsPer100g || 0) * ratio)
  const adjustedFat = Math.round((foodItem.fatPer100g || 0) * ratio)

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]" dialogTitle="Add Food to Meal">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Add Food to Meal
          </DrawerTitle>
          <DrawerDescription>
            Review the scanned product and adjust the quantity.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Food Item Card */}
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {foodItem.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Scanned from barcode
                  </p>
                </div>

                {/* Nutrition per 100g */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Nutrition per 100g:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <MacroBadge
                      macro="calories"
                      size="sm"
                      value={foodItem.caloriesPer100g || 0}
                    />
                    <MacroBadge
                      macro="protein"
                      size="sm"
                      value={foodItem.proteinPer100g || 0}
                    />
                    <MacroBadge
                      macro="carbs"
                      size="sm"
                      value={foodItem.carbsPer100g || 0}
                    />
                    <MacroBadge
                      macro="fat"
                      size="sm"
                      value={foodItem.fatPer100g || 0}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Quantity Selection */}
            <Card className="p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Quantity</h4>
                <div className="flex justify-center">
                  <QuantityControls
                    id="food-quantity"
                    value={quantity}
                    unit="g"
                    onChange={setQuantity}
                    min={1}
                    step={10}
                  />
                </div>
              </div>
            </Card>

            {/* Adjusted Nutrition */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="space-y-4">
                <h4 className="font-medium">Nutrition for {quantity}g:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FlameIcon className="size-4 text-orange-500" />
                    <span className="font-medium">{adjustedCalories}</span>
                    <span className="text-muted-foreground">calories</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <span className="font-medium">{adjustedProtein}g</span>
                    <span className="text-muted-foreground">protein</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-3 rounded-full bg-green-500" />
                    <span className="font-medium">{adjustedCarbs}g</span>
                    <span className="text-muted-foreground">carbs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-3 rounded-full bg-yellow-500" />
                    <span className="font-medium">{adjustedFat}g</span>
                    <span className="text-muted-foreground">fat</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToMeal}
              className="flex-1"
              loading={isAdding}
              disabled={isAdding}
              iconStart={<Plus />}
            >
              Add to Meal
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
