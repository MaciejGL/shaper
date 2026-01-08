'use client'

import { Copy, Minus, Plus } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AnimateNumber } from '@/components/animate-number'
import { Divider } from '@/components/divider'
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
  days: PlanDay[]
  planId: string
  initialSelectedDayId: string
}

export function ShoppingList({
  days,
  planId,
  initialSelectedDayId,
}: ShoppingListProps) {
  const { formatIngredient } = useCookingUnits()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [portionMultiplier, setPortionMultiplier] = useState(1)
  const [selectedDayIds, setSelectedDayIds] = useState<Set<string>>(
    new Set([initialSelectedDayId]),
  )

  // Create unique storage key for this plan
  const storageKey = `shopping-list-${planId}`

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

  // Aggregate ingredients from all selected days
  const aggregatedIngredients: AggregatedIngredient[] = (() => {
    const ingredientMap = new Map<
      string,
      { totalGrams: number; name: string }
    >()

    const selectedDays = days.filter((day) => selectedDayIds.has(day.id))

    // Process all meals from selected days
    selectedDays.forEach((day) => {
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

  const toggleDaySelection = (dayId: string) => {
    const newSelected = new Set(selectedDayIds)
    if (newSelected.has(dayId)) {
      newSelected.delete(dayId)
    } else {
      newSelected.add(dayId)
    }
    setSelectedDayIds(newSelected)
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

  const copyToClipboard = () => {
    const sortedIngredients = aggregatedIngredients.sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    const title = `Shopping List (${aggregatedIngredients.length} items)`
    const portions =
      portionMultiplier > 1 ? `\nPortions: ${portionMultiplier}x` : ''

    const items = sortedIngredients
      .map((item) => {
        const checkMark = checkedItems.has(item.id) ? '[x]' : '[ ]'
        return `${checkMark} ${item.name} - ${item.formattedAmount}`
      })
      .join('\n')

    const text = `${title}${portions}\n\n${items}`

    navigator.clipboard.writeText(text)
    toast.success('Shopping list copied to clipboard')
  }

  if (days.length === 0) {
    return null
  }

  const checkedCount = aggregatedIngredients.filter((item) =>
    checkedItems.has(item.id),
  ).length

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        {days
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((day) => {
            const isSelected = selectedDayIds.has(day.id)
            return (
              <Button
                key={day.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDaySelection(day.id)}
                className="whitespace-nowrap shrink-0 border"
              >
                {day.name}
              </Button>
            )
          })}
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {checkedCount}/{aggregatedIngredients.length} items
          </p>

          <div>
            {/* Add Copy to Clipboard button - copy nicely formatted shopping list to clipboard */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={copyToClipboard}
                iconStart={<Copy />}
                className="mr-2 self-end"
              >
                Copy to Clipboard
              </Button>

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
        <Divider />

        {aggregatedIngredients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No ingredients needed for selected days.
          </div>
        ) : (
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
                      isChecked
                        ? 'bg-muted/50 opacity-60'
                        : 'hover:bg-muted/30',
                    )}
                    onClick={() => handleItemCheck(ingredient.id, !isChecked)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleItemCheck(ingredient.id, Boolean(checked))
                      }
                      className="shrink-0 self-center"
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
        )}
      </div>
    </div>
  )
}
