'use client'

import { Minus, Plus } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  const [value, setValue] = useState<string | undefined>(undefined)
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
    <Accordion type="single" collapsible value={value} onValueChange={setValue}>
      <AccordionItem value="shopping-list">
        <AccordionTrigger variant="default">
          <div className="text-sm flex items-center justify-between w-full">
            <p>Shopping List</p>
            <span className="text-muted-foreground font-normal">
              {checkedCount}/{aggregatedIngredients.length} items
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="p-4">
            <div className="space-y-3">
              {/* Portion multiplier */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={decrementPortions}
                    disabled={portionMultiplier <= 1}
                    iconOnly={<Minus />}
                  />

                  <AnimateNumber
                    value={portionMultiplier}
                    duration={200}
                    className="text-xl font-bold text-primary"
                  />
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={incrementPortions}
                    iconOnly={<Plus />}
                  />
                </div>
                {checkedCount > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearAllChecked}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                )}
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
                          'grid grid-cols-[24px_1fr_auto_auto] items-end gap-3 p-2 rounded-lg transition-all border',
                          isChecked
                            ? 'bg-muted/50 opacity-60'
                            : 'hover:bg-muted/30',
                        )}
                        onClick={() =>
                          handleItemCheck(ingredient.id, !isChecked)
                        }
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
                            'flex-1 grow-[2]',
                            isChecked
                              ? 'line-through text-muted-foreground'
                              : '',
                          )}
                        >
                          {ingredient.name}
                        </span>

                        <span
                          className={cn(
                            'text-sm',
                            isChecked
                              ? 'line-through text-muted-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          {ingredient.formattedAmount}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
