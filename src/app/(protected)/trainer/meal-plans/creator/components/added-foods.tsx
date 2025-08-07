import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { Dispatch, SetStateAction, useCallback } from 'react'

import { MealTotals } from '@/app/(protected)/fitspace/meal-plan/components/meal-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EditableFood } from '@/context/meal-plan-context/meal-plan-context'
import { formatNumberInput } from '@/lib/format-tempo'

// Animation variants for each food item
const itemVariants = {
  initial: {
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
} as const

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function AddedFoods({
  foods,
  removeFood,
  setHasChanges,
  setFoods,
  canEdit,
}: {
  foods: EditableFood[]
  removeFood: (index: number) => void
  setHasChanges: (hasChanges: boolean) => void
  setFoods: Dispatch<SetStateAction<EditableFood[]>>
  canEdit: boolean
}) {
  // Update food in local state
  const updateFood = useCallback(
    (index: number, updates: Partial<EditableFood>) => {
      setFoods((prev) =>
        prev.map((food, i) => (i === index ? { ...food, ...updates } : food)),
      )
      setHasChanges(true)
    },
    [setFoods, setHasChanges],
  )

  return (
    <div className="pb-24">
      <h3 className="text-lg font-medium mb-3">Added Foods</h3>
      <motion.div
        className="grid grid-cols-1 gap-4"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {foods.map((food, index) => (
            <motion.div
              key={food.id || `${food.name}-${index}`}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
            >
              <Card className="p-0 dark:bg-card-on-card group/food">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2 w-full">
                        <h4 className="font-semibold text-lg leading-tight">
                          {food.name}
                        </h4>
                        <TotalNutrients food={food} />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group-hover/food:opacity-100 opacity-0"
                        onClick={() => removeFood(index)}
                        iconOnly={<XIcon />}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`quantity-${food.id}`}
                          className="text-xs font-medium"
                        >
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${food.id}`}
                          type="text"
                          variant="secondary"
                          value={food.quantity ?? ''}
                          onChange={(e) => {
                            const formattedValue = formatNumberInput(e)
                            updateFood(index, {
                              quantity:
                                formattedValue === ''
                                  ? null
                                  : Number(formattedValue),
                            })
                          }}
                          placeholder="Enter quantity"
                          className="h-9"
                          iconEnd={<p>{food.unit}</p>}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function TotalNutrients({ food }: { food: EditableFood }) {
  const calculateNutrition = (food: EditableFood, qty: number | null) => {
    // Handle null or invalid quantities
    if (qty === null || qty === undefined || qty <= 0 || isNaN(qty)) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    }

    // Calculate based on unit type
    const factor = qty / 100
    return {
      calories: Math.round((Number(food.caloriesPer100g) || 0) * factor),
      protein:
        Math.round((Number(food.proteinPer100g) || 0) * factor * 10) / 10,
      carbs: Math.round((Number(food.carbsPer100g) || 0) * factor * 10) / 10,
      fat: Math.round((Number(food.fatPer100g) || 0) * factor * 10) / 10,
      fiber: Math.round((Number(food.fiberPer100g) || 0) * factor * 10) / 10,
    }
  }

  const nutrition = calculateNutrition(food, food.quantity)
  return (
    <MealTotals
      plannedTotals={{
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
      }}
      hasLogs={false}
    />
  )
}
