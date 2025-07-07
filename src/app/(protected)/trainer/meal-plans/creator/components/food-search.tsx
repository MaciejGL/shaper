'use client'

import { Plus, Save, Search, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type EditableFood,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'
import { formatNumberInput } from '@/lib/format-tempo'

interface FoodSearchProps {
  dayId: string
  hour: number
  onClose: () => void
}

// Simple food search using the existing API
async function searchFoods(query: string) {
  if (query.length < 2) return []

  try {
    const response = await fetch(
      `/api/food/search?q=${encodeURIComponent(query)}`,
    )
    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    return (
      data.products?.map((product: any) => ({
        name: product.product_name,
        openFoodFactsId: product.code,
        // Convert all nutrition values to numbers explicitly
        caloriesPer100g: Number(product.nutriments?.['energy-kcal_100g']) || 0,
        proteinPer100g: Number(product.nutriments?.proteins_100g) || 0,
        carbsPer100g: Number(product.nutriments?.carbohydrates_100g) || 0,
        fatPer100g: Number(product.nutriments?.fat_100g) || 0,
        fiberPer100g: Number(product.nutriments?.fiber_100g) || 0,
      })) || []
    )
  } catch (error) {
    console.error('Food search error:', error)
    throw error
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function FoodSearch({ dayId, hour, onClose }: FoodSearchProps) {
  const { getMealByHour, saveMeal } = useMealPlanContext()

  // Local state for editing
  const [foods, setFoods] = useState<EditableFood[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load existing foods when component mounts
  useEffect(() => {
    const existingMeal = getMealByHour(dayId, hour)
    if (existingMeal) {
      const existingFoods: EditableFood[] = existingMeal.foods.map((food) => ({
        id: food.id,
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        // Convert all nutrition values to numbers - they might be strings from the API
        caloriesPer100g: Number(food.caloriesPer100g) || 0,
        proteinPer100g: Number(food.proteinPer100g) || 0,
        carbsPer100g: Number(food.carbsPer100g) || 0,
        fatPer100g: Number(food.fatPer100g) || 0,
        fiberPer100g: Number(food.fiberPer100g) || 0,
        openFoodFactsId: food.openFoodFactsId || null,
      }))
      setFoods(existingFoods)
    }
  }, [dayId, hour, getMealByHour])

  // Handle search
  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchFoods(term)

      setSearchResults(results || [])
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search foods')
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 2) {
      handleSearch(debouncedQuery.trim())
    } else {
      setSearchResults([])
    }
  }, [debouncedQuery, handleSearch])

  // Add food to local state
  const addFood = useCallback(
    (foodItem: any) => {
      const newFood: EditableFood = {
        name: foodItem.name,
        quantity: 100,
        unit: 'g',
        // Ensure all nutrition values are numbers
        caloriesPer100g: Number(foodItem.caloriesPer100g) || 0,
        proteinPer100g: Number(foodItem.proteinPer100g) || 0,
        carbsPer100g: Number(foodItem.carbsPer100g) || 0,
        fatPer100g: Number(foodItem.fatPer100g) || 0,
        fiberPer100g: Number(foodItem.fiberPer100g) || 0,
        openFoodFactsId: foodItem.openFoodFactsId,
      }

      // Check for duplicates
      const isDuplicate = foods.some(
        (food) =>
          (food.openFoodFactsId &&
            food.openFoodFactsId === newFood.openFoodFactsId) ||
          (!food.openFoodFactsId && food.name === newFood.name),
      )

      if (isDuplicate) {
        toast.error('This food is already added to the meal')
        return
      }

      setFoods((prev) => [...prev, newFood])
      setHasChanges(true)
      setSearchTerm('')
      setSearchResults([])
    },
    [foods],
  )

  // Update food in local state
  const updateFood = useCallback(
    (index: number, updates: Partial<EditableFood>) => {
      setFoods((prev) =>
        prev.map((food, i) => (i === index ? { ...food, ...updates } : food)),
      )
      setHasChanges(true)
    },
    [],
  )

  // Remove food from local state
  const removeFood = useCallback((index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index))
    setHasChanges(true)
  }, [])

  // Save changes
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      await saveMeal(dayId, hour, foods)
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Error saving meal:', error)
      // Error is handled in the context
    } finally {
      setIsSaving(false)
    }
  }, [hasChanges, saveMeal, dayId, hour, foods, onClose])

  // Cancel changes
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (
        confirm('You have unsaved changes. Are you sure you want to close?')
      ) {
        onClose()
      }
    } else {
      onClose()
    }
  }, [hasChanges, onClose])

  const calculateNutrition = (food: EditableFood, qty: number) => {
    // Handle invalid quantities
    if (!qty || qty < 0 || isNaN(qty)) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    }

    // Calculate based on unit type

    // Use per-100g values with factor calculation for grams/ml/etc
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

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Input
            id="food-search"
            placeholder="Search for foods..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            iconStart={<Search />}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Searching for foods...
            </p>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Search Results</h3>
            <div className="grid gap-2">
              {searchResults.map((food, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Per 100g:
                        </p>
                        <p className="text-sm text-primary">
                          {food.caloriesPer100g || 0}kcal
                        </p>
                        <p className="text-sm text-green-500/80">
                          {food.proteinPer100g || 0}P
                        </p>
                        <p className="text-sm text-blue-500/80">
                          {food.carbsPer100g || 0}C
                        </p>
                        <p className="text-sm text-yellow-500/80">
                          {food.fatPer100g || 0}F
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => addFood(food)}
                      disabled={isSearching}
                      iconOnly={<Plus />}
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Added Foods */}
        {foods.length > 0 && (
          <div className="pb-24">
            <h3 className="text-sm font-medium mb-3">Added Foods</h3>
            <div className="grid gap-4">
              {foods.map((food, index) => (
                <Card key={food.id || food.name} className="p-0">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {food.name}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFood(index)}
                          iconOnly={<X />}
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
                            value={food.quantity}
                            onChange={(e) => {
                              const formattedValue = formatNumberInput(e)
                              updateFood(index, {
                                quantity: Number(formattedValue),
                              })
                            }}
                            min="0.1"
                            step={food.unit === 'serving' ? '0.1' : '1'}
                            className="h-9"
                            iconEnd={<p>{food.unit}</p>}
                          />
                        </div>
                      </div>

                      <div className="">
                        {(() => {
                          const nutrition = calculateNutrition(
                            food,
                            food.quantity,
                          )
                          return (
                            <div className="grid grid-cols-4 gap-3">
                              <div className="text-center bg-primary/10 rounded-lg p-3">
                                <p className="text-lg font-bold text-primary">
                                  {nutrition.calories}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  kcal
                                </p>
                              </div>
                              <div className="text-center bg-green-500/10 rounded-lg p-3">
                                <p className="text-lg font-bold">
                                  {nutrition.protein}g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  protein
                                </p>
                              </div>
                              <div className="text-center bg-blue-500/10 rounded-lg p-3">
                                <p className="text-lg font-bold">
                                  {nutrition.carbs}g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  carbs
                                </p>
                              </div>
                              <div className="text-center bg-yellow-500/10 rounded-lg p-3">
                                <p className="text-lg font-bold">
                                  {nutrition.fat}g
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  fat
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {foods.length === 0 && searchResults.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Search for foods to add to this meal
          </div>
        )}
      </div>

      {/* Footer with Save/Cancel buttons */}
      <div className="p-4 sticky bottom-0 bg-background">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? 'Unsaved changes' : 'No changes'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
