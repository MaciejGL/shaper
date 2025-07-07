'use client'

import { Clock, Plus, Utensils } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { FoodSearch } from './food-search'

interface FoodItem {
  id: string
  name: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  quantity: number
  unit: string
}

interface MealTime {
  id: string
  name: string
  time: string
  foods: FoodItem[]
}

interface MealTimeSlotsProps {
  dayName: string
}

const slots = Array.from({ length: 17 }).map((_, index) => {
  const hour = index + 7
  return {
    id: `slot-${hour}`,
    name: `${hour}:00`,
    time: `${hour.toString().padStart(2, '0')}:00`,
    foods: [],
  }
})

export function MealTimeSlots({}: MealTimeSlotsProps) {
  const [mealSlots, setMealSlots] = useState<MealTime[]>(slots)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const calculateMealNutrition = (foods: FoodItem[]) => {
    return foods.reduce(
      (total, food) => {
        const factor = food.quantity / 100
        return {
          calories: total.calories + food.calories * factor,
          protein: total.protein + food.protein * factor,
          carbs: total.carbs + food.carbs * factor,
          fat: total.fat + food.fat * factor,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const addFoodToSlot = (slotId: string, food: FoodItem) => {
    setMealSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (slot.id === slotId) {
          const existingFoodIndex = slot.foods.findIndex(
            (existingFood) => existingFood.id === food.id,
          )

          if (existingFoodIndex !== -1) {
            const updatedFoods = [...slot.foods]
            updatedFoods[existingFoodIndex] = food
            return { ...slot, foods: updatedFoods }
          } else {
            return { ...slot, foods: [...slot.foods, food] }
          }
        }
        return slot
      }),
    )
  }

  const removeFoodFromSlot = (slotId: string, foodId: string) => {
    setMealSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, foods: slot.foods.filter((food) => food.id !== foodId) }
          : slot,
      ),
    )
  }

  const totalDayNutrition = mealSlots.reduce(
    (total, slot) => {
      const mealNutrition = calculateMealNutrition(slot.foods)
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const selectedSlotData = mealSlots.find((slot) => slot.id === selectedSlot)

  return (
    <div className="space-y-6">
      {/* Daily Nutrition Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Daily Nutrition Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {Math.round(totalDayNutrition.calories)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Calories
              </p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold">
                {Math.round(totalDayNutrition.protein)}g
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Protein
              </p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold">
                {Math.round(totalDayNutrition.carbs)}g
              </p>
              <p className="text-sm text-muted-foreground font-medium">Carbs</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold">
                {Math.round(totalDayNutrition.fat)}g
              </p>
              <p className="text-sm text-muted-foreground font-medium">Fat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Time Slots */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Meal Schedule</h2>
        </div>

        <div className="grid gap-2">
          {mealSlots.map((slot) => (
            <TimeSlot
              key={slot.id}
              slot={slot}
              onEdit={() => setSelectedSlot(slot.id)}
            />
          ))}
        </div>
      </div>

      {/* Food Search Drawer */}
      {selectedSlot && selectedSlotData && (
        <Drawer
          open={!!selectedSlot}
          onOpenChange={(open) => !open && setSelectedSlot(null)}
          direction="right"
        >
          <DrawerContent dialogTitle="Edit Meal">
            <DrawerHeader className="border-b">
              <DrawerTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Edit {selectedSlotData.time} Meal
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-6 overflow-y-auto">
              <FoodSearch
                onFoodSelect={(food) => addFoodToSlot(selectedSlot, food)}
                onFoodRemove={(foodId) =>
                  removeFoodFromSlot(selectedSlot, foodId)
                }
                existingFoods={selectedSlotData.foods}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

function TimeSlot({ slot, onEdit }: { slot: MealTime; onEdit: () => void }) {
  const calculateMealNutrition = (foods: FoodItem[]) => {
    return foods.reduce(
      (total, food) => {
        const factor = food.quantity / 100
        return {
          calories: total.calories + food.calories * factor,
          protein: total.protein + food.protein * factor,
          carbs: total.carbs + food.carbs * factor,
          fat: total.fat + food.fat * factor,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const mealNutrition = calculateMealNutrition(slot.foods)
  const hasFood = slot.foods.length > 0

  return (
    <Card
      className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
        hasFood ? 'border-l-4 border-l-primary/50' : 'hover:border-primary/30'
      }`}
      onClick={onEdit}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="font-mono text-sm min-w-[60px] justify-center"
            >
              {slot.time}
            </Badge>

            {hasFood ? (
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {slot.foods.length} item{slot.foods.length !== 1 ? 's' : ''}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(mealNutrition.calories)} cal
                  </Badge>
                </div>

                <div className="space-y-1">
                  {slot.foods.slice(0, 2).map((food, index) => (
                    <div
                      key={`${food.id}-${index}`}
                      className="text-sm text-muted-foreground"
                    >
                      {food.name} ({food.quantity}
                      {food.unit})
                    </div>
                  ))}
                  {slot.foods.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{slot.foods.length - 2} more item
                      {slot.foods.length - 2 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center text-muted-foreground">
                <span className="text-sm">No food added</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasFood && (
              <div className="text-right text-xs text-muted-foreground hidden sm:block">
                <div>P: {Math.round(mealNutrition.protein)}g</div>
                <div>C: {Math.round(mealNutrition.carbs)}g</div>
                <div>F: {Math.round(mealNutrition.fat)}g</div>
              </div>
            )}

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
