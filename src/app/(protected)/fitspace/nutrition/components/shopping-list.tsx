'use client'

import { Minus, Plus } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'
import { cn } from '@/lib/utils'

type PlanDay = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface AggregatedIngredient {
  id: string
  name: string
  totalGrams: number
  formattedAmount: string
}

interface ShoppingListProps {
  day: PlanDay
  planId: string
}

export function ShoppingList({ day, planId }: ShoppingListProps) {
  const { formatIngredient } = useCookingUnits()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [portionMultiplier, setPortionMultiplier] = useState(1)

  // Create unique storage key for this plan and day
  const storageKey = `shopping-list-${planId}-day-${day.dayNumber}`

  // Load checked state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        startTransition(() => {
          setCheckedItems(new Set(parsed))
        })
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [storageKey])

  // Save checked state to localStorage
  const saveCheckedState = (newCheckedItems: Set<string>) => {
    localStorage.setItem(storageKey, JSON.stringify([...newCheckedItems]))
    setCheckedItems(newCheckedItems)
  }

  // Aggregate ingredients from all meals in the day
  const aggregatedIngredients: AggregatedIngredient[] = (() => {
    const ingredientMap = new Map<
      string,
      { totalGrams: number; name: string }
    >()

    // Process all meals and their ingredients
    day.meals?.forEach((planMeal) => {
      planMeal.meal.ingredients?.forEach((ingredientItem) => {
        // Use override grams if available, otherwise use blueprint grams
        const override = planMeal.ingredientOverrides?.find(
          (o) => o.mealIngredient.id === ingredientItem.id,
        )
        const baseGrams = override?.grams ?? ingredientItem.grams
        const adjustedGrams = baseGrams * portionMultiplier
        const ingredientName = ingredientItem.ingredient.name

        if (ingredientMap.has(ingredientName)) {
          const existing = ingredientMap.get(ingredientName)!
          existing.totalGrams += adjustedGrams
        } else {
          ingredientMap.set(ingredientName, {
            totalGrams: adjustedGrams,
            name: ingredientName,
          })
        }
      })
    })

    // Convert to array and format amounts
    return Array.from(ingredientMap.entries()).map(([name, data]) => ({
      id: name, // Use name as ID since it's unique
      name: data.name,
      totalGrams: data.totalGrams,
      formattedAmount: formatIngredient(data.totalGrams, data.name),
    }))
  })()

  const handleItemCheck = (ingredientId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems)
    if (checked) {
      newCheckedItems.add(ingredientId)
    } else {
      newCheckedItems.delete(ingredientId)
    }
    saveCheckedState(newCheckedItems)
  }

  const clearAllChecked = () => {
    saveCheckedState(new Set())
  }

  const incrementPortions = () => {
    setPortionMultiplier((prev) => prev + 1)
  }

  const decrementPortions = () => {
    setPortionMultiplier((prev) => Math.max(1, prev - 1))
  }

  if (aggregatedIngredients.length === 0) {
    return null
  }

  const checkedCount = aggregatedIngredients.filter((item) =>
    checkedItems.has(item.id),
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {checkedCount}/{aggregatedIngredients.length} items
        </p>

        <div>
          <p className="text-sm text-muted-foreground">Portions</p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon-md"
              onClick={decrementPortions}
              disabled={portionMultiplier <= 1}
              iconOnly={<Minus />}
              aria-label="Decrease portions"
            >
              Decrease
            </Button>

            <div className="min-w-6 text-center">
              <AnimateNumber
                value={portionMultiplier}
                duration={200}
                className="text-xl font-semibold text-foreground"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon-md"
              onClick={incrementPortions}
              iconOnly={<Plus />}
              aria-label="Increase portions"
            >
              Increase
            </Button>

            {checkedCount > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={clearAllChecked}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {aggregatedIngredients
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((ingredient) => {
            const isChecked = checkedItems.has(ingredient.id)
            return (
              <div
                key={ingredient.id}
                className={cn(
                  'grid grid-cols-[24px_1fr_auto] items-center gap-3 p-3 rounded-xl transition-all border',
                  isChecked ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/30',
                )}
                onClick={() => handleItemCheck(ingredient.id, !isChecked)}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleItemCheck(ingredient.id, Boolean(checked))
                  }
                  className="flex-shrink-0 self-center"
                />
                <span
                  className={cn(
                    'text-sm',
                    isChecked ? 'line-through text-muted-foreground' : '',
                  )}
                >
                  {ingredient.name}
                </span>

                <span
                  className={cn(
                    'text-sm text-muted-foreground',
                    isChecked ? 'line-through' : '',
                  )}
                >
                  {ingredient.formattedAmount}
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
