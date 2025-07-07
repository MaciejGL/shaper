'use client'

import { Check, Package, Plus, SearchIcon, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// Custom debounce hook
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

// Raw API response interface (from Open Food Facts)
interface OpenFoodFactsProduct {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    'energy-kcal_serving'?: number
    proteins_100g?: number
    proteins_serving?: number
    carbohydrates_100g?: number
    carbohydrates_serving?: number
    fat_100g?: number
    fat_serving?: number
    fiber_100g?: number
    fiber_serving?: number
    sugars_100g?: number
    sugars_serving?: number
    salt_100g?: number
    salt_serving?: number
  }
  ingredients_text?: string
  allergens?: string
  image_url?: string
  image_front_url?: string
  serving_size?: string
  serving_quantity?: number
}

// API response structure
interface FoodSearchApiResponse {
  products: OpenFoodFactsProduct[]
  count?: number
  page?: number
  page_count?: number
  page_size?: number
}

// Processed interface for our component
interface FoodSearchResult {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    'energy-kcal_serving'?: number
    proteins_100g?: number
    proteins_serving?: number
    carbohydrates_100g?: number
    carbohydrates_serving?: number
    fat_100g?: number
    fat_serving?: number
    fiber_100g?: number
    fiber_serving?: number
  }
  image_url?: string
  image_front_url?: string
}

interface SelectedFood {
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

interface SelectedFoodWithQuantity extends FoodSearchResult {
  selectedQuantity: number
  selectedUnit: string
  originalFoodId?: string
  assignedId?: string
  isExisting?: boolean
}

interface FoodSearchProps {
  onFoodSelect: (food: SelectedFood) => void
  onFoodRemove?: (foodId: string) => void
  existingFoods?: SelectedFood[]
}

export function FoodSearch({
  onFoodSelect,
  onFoodRemove,
  existingFoods = [],
}: FoodSearchProps) {
  const [selectedFoods, setSelectedFoods] = useState<
    SelectedFoodWithQuantity[]
  >([])

  useEffect(() => {
    if (existingFoods.length > 0) {
      const convertedFoods: SelectedFoodWithQuantity[] = existingFoods.map(
        (food) => ({
          code: food.id,
          product_name: food.name,
          brands: food.brand,
          nutriments: {
            'energy-kcal_100g': (food.calories / food.quantity) * 100,
            proteins_100g: (food.protein / food.quantity) * 100,
            carbohydrates_100g: (food.carbs / food.quantity) * 100,
            fat_100g: (food.fat / food.quantity) * 100,
            fiber_100g: (food.fiber / food.quantity) * 100,
          },
          selectedQuantity: food.quantity,
          selectedUnit: food.unit,
          originalFoodId: food.id,
          isExisting: true,
        }),
      )
      setSelectedFoods(convertedFoods)
    }
  }, [existingFoods])

  const handleAddFood = (food: FoodSearchResult) => {
    if (!food) return

    const isAlreadySelected = selectedFoods.some((f) => f.code === food.code)
    if (isAlreadySelected) return

    const newFoodId = `${food.code}-${Date.now()}`
    // Choose default unit based on available data
    const hasServingData =
      Number((food.nutriments as any)['energy-kcal_serving']) > 0
    const defaultUnit = hasServingData ? 'serving' : 'g'
    const defaultQuantity = defaultUnit === 'serving' ? 1 : 100

    const newSelectedFood: SelectedFoodWithQuantity = {
      ...food,
      selectedQuantity: defaultQuantity,
      selectedUnit: defaultUnit,
      originalFoodId: undefined,
      assignedId: newFoodId,
      isExisting: false,
    }

    setSelectedFoods([...selectedFoods, newSelectedFood])

    const nutrition = calculateNutrition(food, defaultQuantity, defaultUnit)
    const newFood: SelectedFood = {
      id: newFoodId,
      name: food.product_name || 'Unknown Product',
      brand: food.brands,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber,
      quantity: defaultQuantity,
      unit: defaultUnit,
    }

    onFoodSelect(newFood)
  }

  const calculateNutrition = (
    food: FoodSearchResult,
    qty: number,
    unit: string = 'g',
  ) => {
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

    const nutrients = food.nutriments

    // Calculate based on unit type
    if (unit === 'serving') {
      // Use per-serving values directly, multiply by quantity
      return {
        calories: Math.round(
          (Number(nutrients['energy-kcal_serving']) || 0) * qty,
        ),
        protein:
          Math.round((Number(nutrients.proteins_serving) || 0) * qty * 10) / 10,
        carbs:
          Math.round(
            (Number(nutrients.carbohydrates_serving) || 0) * qty * 10,
          ) / 10,
        fat: Math.round((Number(nutrients.fat_serving) || 0) * qty * 10) / 10,
        fiber:
          Math.round((Number(nutrients.fiber_serving) || 0) * qty * 10) / 10,
      }
    } else {
      // Use per-100g values with factor calculation for grams/ml/etc
      const factor = qty / 100
      return {
        calories: Math.round(
          (Number(nutrients['energy-kcal_100g']) || 0) * factor,
        ),
        protein:
          Math.round((Number(nutrients.proteins_100g) || 0) * factor * 10) / 10,
        carbs:
          Math.round(
            (Number(nutrients.carbohydrates_100g) || 0) * factor * 10,
          ) / 10,
        fat: Math.round((Number(nutrients.fat_100g) || 0) * factor * 10) / 10,
        fiber:
          Math.round((Number(nutrients.fiber_100g) || 0) * factor * 10) / 10,
      }
    }
  }

  const handleUpdateQuantity = (foodCode: string, newQuantity: string) => {
    const qty = Number.parseFloat(newQuantity) || 0

    // Update the selectedFoods state
    setSelectedFoods(
      selectedFoods.map((food) =>
        food.code === foodCode ? { ...food, selectedQuantity: qty } : food,
      ),
    )
    // Find the food and update nutrition

    const food = selectedFoods.find((f) => f.code === foodCode)
    if (food && qty > 0) {
      const nutrition = calculateNutrition(food, qty, food.selectedUnit)
      const updatedFood: SelectedFood = {
        id: food.isExisting ? food.originalFoodId! : food.assignedId!,
        name: food.product_name || 'Unknown Product',
        brand: food.brands,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        quantity: qty,
        unit: food.selectedUnit,
      }
      onFoodSelect(updatedFood)
    }
  }

  const handleUpdateUnit = (foodCode: string, newUnit: string) => {
    setSelectedFoods(
      selectedFoods.map((food) =>
        food.code === foodCode ? { ...food, selectedUnit: newUnit } : food,
      ),
    )

    const food = selectedFoods.find((f) => f.code === foodCode)
    if (food) {
      const nutrition = calculateNutrition(food, food.selectedQuantity, newUnit)
      const updatedFood: SelectedFood = {
        id: food.isExisting ? food.originalFoodId! : food.assignedId!,
        name: food.product_name || 'Unknown Product',
        brand: food.brands,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        quantity: food.selectedQuantity,
        unit: newUnit,
      }
      onFoodSelect(updatedFood)
    }
  }

  const handleRemoveFood = (foodCode: string) => {
    setSelectedFoods(selectedFoods.filter((food) => food.code !== foodCode))
    if (onFoodRemove) {
      onFoodRemove(foodCode)
    }
  }

  return (
    <div className="space-y-6">
      <Search onFoodSelect={handleAddFood} selectedFoods={selectedFoods} />

      {selectedFoods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Selected Foods</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedFoods.length}
            </Badge>
          </div>

          {selectedFoods.map((selectedFood) => (
            <Card
              key={selectedFood.code}
              className="border-l-4 border-l-primary/50 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm leading-tight">
                        {selectedFood.product_name || 'Unknown Product'}
                      </h4>
                      {selectedFood.brands && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedFood.brands}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFood(selectedFood.code)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`quantity-${selectedFood.code}`}
                        className="text-xs font-medium"
                      >
                        Quantity
                      </Label>
                      <Input
                        id={`quantity-${selectedFood.code}`}
                        type="number"
                        value={selectedFood.selectedQuantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            selectedFood.code,
                            e.target.value,
                          )
                        }
                        min="0.1"
                        step={
                          selectedFood.selectedUnit === 'serving' ? '0.5' : '1'
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`unit-${selectedFood.code}`}
                        className="text-xs font-medium"
                      >
                        Unit
                      </Label>
                      <Select
                        value={selectedFood.selectedUnit}
                        onValueChange={(value) =>
                          handleUpdateUnit(selectedFood.code, value)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="ml">Milliliters (ml)</SelectItem>
                          <SelectItem value="cup">Cup</SelectItem>
                          <SelectItem value="tbsp">Tablespoon</SelectItem>
                          <SelectItem value="tsp">Teaspoon</SelectItem>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="serving">Serving</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 border">
                    <p className="text-xs font-medium mb-3 text-muted-foreground">
                      Nutrition for {selectedFood.selectedQuantity}{' '}
                      {selectedFood.selectedUnit}
                    </p>
                    {(() => {
                      const nutrition = calculateNutrition(
                        selectedFood,
                        selectedFood.selectedQuantity,
                        selectedFood.selectedUnit,
                      )
                      return (
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">
                              {nutrition.calories}
                            </p>
                            <p className="text-xs text-muted-foreground">cal</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">
                              {nutrition.protein}g
                            </p>
                            <p className="text-xs text-muted-foreground">
                              protein
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">
                              {nutrition.carbs}g
                            </p>
                            <p className="text-xs text-muted-foreground">
                              carbs
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">
                              {nutrition.fat}g
                            </p>
                            <p className="text-xs text-muted-foreground">fat</p>
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
      )}
    </div>
  )
}

type SearchProps = {
  onFoodSelect: (food: FoodSearchResult) => void
  selectedFoods: SelectedFoodWithQuantity[]
}

function Search({ onFoodSelect, selectedFoods }: SearchProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 2) {
      searchFoods(debouncedQuery.trim())
    } else {
      setSearchResults([])
      setShowList(false)
    }
  }, [debouncedQuery])

  const searchFoods = async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)
    setShowList(true)

    try {
      const response = await fetch(
        `/api/food/search?q=${encodeURIComponent(searchQuery)}`,
      )

      if (!response.ok) {
        throw new Error(
          `Search failed: ${response.status} ${response.statusText}`,
        )
      }

      const data: FoodSearchApiResponse = await response.json()

      const products = data.products || []

      // Process API response to match expected interface
      const processedProducts: FoodSearchResult[] = products
        .filter(
          (product: OpenFoodFactsProduct) =>
            product.product_name && product.nutriments,
        )
        .map((product: OpenFoodFactsProduct) => ({
          code: product.code,
          product_name: product.product_name,
          brands: product.brands,
          nutriments: {
            'energy-kcal_100g':
              Number(product.nutriments['energy-kcal_100g']) || 0,
            'energy-kcal_serving':
              Number((product.nutriments as any)['energy-kcal_serving']) || 0,
            proteins_100g: Number(product.nutriments.proteins_100g) || 0,
            proteins_serving:
              Number((product.nutriments as any).proteins_serving) || 0,
            carbohydrates_100g:
              Number(product.nutriments.carbohydrates_100g) || 0,
            carbohydrates_serving:
              Number((product.nutriments as any).carbohydrates_serving) || 0,
            fat_100g: Number(product.nutriments.fat_100g) || 0,
            fat_serving: Number((product.nutriments as any).fat_serving) || 0,
            fiber_100g: Number(product.nutriments.fiber_100g) || 0,
            fiber_serving:
              Number((product.nutriments as any).fiber_serving) || 0,
          },
          image_url: product.image_url,
          image_front_url: product.image_front_url,
        }))

      setSearchResults(processedProducts)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="food-search" className="text-sm font-medium">
          Search for food
        </Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="food-search"
            placeholder="Type food name (e.g., 'banana', 'chicken', 'milk')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
            onFocus={() => query.trim().length > 2 && setShowList(true)}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <p className="font-medium">Search Error</p>
          <p>{error}</p>
        </div>
      )}

      {showList && (
        <div className="space-y-3">
          {isLoading && (
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

          {!isLoading &&
            searchResults.length === 0 &&
            query.trim().length > 2 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No foods found</p>
                <p className="text-sm">
                  Try searching for "{query}" with different terms
                </p>
              </div>
            )}

          {!isLoading && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">
                Found {searchResults.length} food
                {searchResults.length === 1 ? '' : 's'}
              </p>

              <div className="space-y-2">
                {searchResults.map((food) => (
                  <FoodSearchItem
                    key={food.code}
                    food={food}
                    isSelected={selectedFoods.some((f) => f.code === food.code)}
                    onSelect={() => {
                      onFoodSelect(food)
                      setShowList(false)
                      setQuery('')
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface FoodSearchItemProps {
  food: FoodSearchResult
  isSelected: boolean
  onSelect: () => void
}

function FoodSearchItem({ food, isSelected, onSelect }: FoodSearchItemProps) {
  const nutrients = food.nutriments
  const calories = Number(nutrients['energy-kcal_100g']) || 0
  const protein = Number(nutrients.proteins_100g) || 0
  const carbs = Number(nutrients.carbohydrates_100g) || 0
  const fat = Number(nutrients.fat_100g) || 0

  return (
    <Card
      className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'hover:border-primary/30 hover:bg-muted/30'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm leading-tight">
                  {food.product_name || 'Unknown Product'}
                </h3>
                {food.brands && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {food.brands}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-medium">
                {calories}cal
              </Badge>
              <Badge variant="outline" className="text-xs">
                P: {protein.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="text-xs">
                C: {carbs.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="text-xs">
                F: {fat.toFixed(1)}g
              </Badge>
            </div>
          </div>

          <Button
            variant={isSelected ? 'default' : 'secondary'}
            size="sm"
            className="ml-3 shrink-0"
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Selected
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
