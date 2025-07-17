'use client'

import {
  FlameIcon,
  Plus,
  ScanBarcodeIcon,
  SearchIcon,
  ShoppingCart,
  XIcon,
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { FoodSearchLoading } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-loading'
import { FoodSearchResults } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-results'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchResult, searchFoods } from '@/lib/food-search'
import { createTimestampWithDateAndCurrentTime } from '@/lib/utc-date-utils'
import { cn } from '@/lib/utils'

import { MealTotals } from './meal-card'
import { SelectedMeal } from './meal-logging-drawer'
import { QuantityControls } from './quantity-controls'
import { useMealLogging } from './use-meal-logging'

interface CustomFoodSearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  mealId: string
  onFoodAdded?: () => void
  selectedMeal?: SelectedMeal | null
}

// Component to show scanned food result inline
function ScannedFoodResult({
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

export function CustomFoodSearchDrawer({
  isOpen,
  onClose,
  mealId,
  onFoodAdded,
  selectedMeal,
}: CustomFoodSearchDrawerProps) {
  const { handleRemoveLogItem, handleAddCustomFood } = useMealLogging()
  const [date] = useQueryState('date') // Get current date from URL
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false)
  const [scannedFood, setScannedFood] = useState<SearchResult | null>(null)

  // Handle search
  const handleSearch = useCallback(
    async (term: string) => {
      if (debouncedQuery.length < 2 || searchTerm.length < 2) {
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
    },
    [debouncedQuery, searchTerm],
  )

  // Handle barcode scan result
  const handleBarcodeScanned = async (barcode: string) => {
    try {
      setIsLookingUpBarcode(true)

      // Look up product using existing API endpoint
      const response = await fetch(`/api/food/search?barcode=${barcode}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup product')
      }

      const product = data.product
      if (!product || !product.product) {
        toast.error('Product not found. Please try searching manually.')
        return
      }

      // Extract product data from OpenFoodFacts format
      const productInfo = product.product
      const nutriments = productInfo.nutriments || {}

      // Create SearchResult-like object from barcode lookup
      const foodItem: SearchResult = {
        name: productInfo.product_name || 'Unknown Product',
        caloriesPer100g: nutriments['energy-kcal_100g'] || 0,
        proteinPer100g: nutriments['proteins_100g'] || 0,
        carbsPer100g: nutriments['carbohydrates_100g'] || 0,
        fatPer100g: nutriments['fat_100g'] || 0,
        fiberPer100g: nutriments['fiber_100g'] || 0,
        openFoodFactsId: product.code || barcode,
      }

      // Show scanned food in the main search area
      setScannedFood(foodItem)
      // Clear search results to focus on scanned item
      setSearchResults([])
      setSearchTerm('')
    } catch (error) {
      console.error('Error looking up barcode:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to lookup product',
      )
    } finally {
      setIsLookingUpBarcode(false)
    }
  }

  // Handle adding food to meal with custom quantity
  const handleAddFoodToMeal = async (
    foodItem: SearchResult,
    quantity: number,
  ) => {
    try {
      // Add directly to the current meal using the hook
      await handleAddCustomFood({
        mealId,
        name: foodItem.name,
        quantity: quantity, // Use the selected quantity
        unit: 'g',
        caloriesPer100g: foodItem.caloriesPer100g,
        proteinPer100g: foodItem.proteinPer100g,
        carbsPer100g: foodItem.carbsPer100g,
        fatPer100g: foodItem.fatPer100g,
        fiberPer100g: foodItem.fiberPer100g,
        openFoodFactsId: foodItem.openFoodFactsId,
        loggedAt: createTimestampWithDateAndCurrentTime(date), // Date being viewed + current time
      })

      toast.success(`Added ${foodItem.name} to meal`)

      // Call onFoodAdded callback if provided
      onFoodAdded?.()

      // Close all drawers after successful addition
      handleClose()
    } catch (error) {
      // Error handling is already done in the hook's onError callback
      console.error('Error adding food:', error)
      throw error // Re-throw so ScannedFoodResult can handle it
    }
  }

  // Handle adding food from search results (existing flow)
  const addFood = async (foodItem: SearchResult) => {
    try {
      await handleAddFoodToMeal(foodItem, 100) // Default to 100g for search results
    } catch (error) {
      console.error('Error adding food:', error)
    }
  }

  // Trigger search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 2) {
      handleSearch(debouncedQuery.trim())
    }
  }, [debouncedQuery, handleSearch])

  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    setScannedFood(null)
    onClose()
  }

  const barcodeEnabled = true

  return (
    <>
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerContent className="h-full" dialogTitle="Search for products">
          <DrawerHeader>
            <DrawerTitle>Search for products</DrawerTitle>
            <DrawerDescription>
              Search for products to add to this meal.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Show loading state */}
              {(isSearching || isLookingUpBarcode) && <FoodSearchLoading />}

              {/* Show scanned food result */}
              {scannedFood && !isLookingUpBarcode && (
                <ScannedFoodResult
                  foodItem={scannedFood}
                  onAddToMeal={handleAddFoodToMeal}
                  onRemove={() => setScannedFood(null)}
                />
              )}

              {/* Show search results only if no scanned food */}
              {!scannedFood &&
                searchResults.length > 0 &&
                !isLookingUpBarcode && (
                  <FoodSearchResults
                    searchResults={searchResults}
                    addFood={addFood}
                    removeFood={handleRemoveLogItem}
                    selectedMeal={selectedMeal}
                  />
                )}

              {/* Show no results message */}
              {!scannedFood &&
                debouncedQuery.length > 2 &&
                !isSearching &&
                !isLookingUpBarcode &&
                searchResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No foods found. Try a different search term.
                  </div>
                )}
            </div>
          </div>
          <div
            className={cn(
              'grid gap-2 p-4',
              barcodeEnabled && 'grid-cols-[1fr_auto]',
              !barcodeEnabled && 'grid-cols-[1fr]',
            )}
          >
            <Input
              id="food-search"
              placeholder="Search for foods..."
              variant="secondary"
              iconStart={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full grow"
              onFocusCapture={() => {
                setSearchTerm('')
              }}
            />

            {barcodeEnabled && (
              <Button
                variant="secondary"
                iconStart={<ScanBarcodeIcon />}
                onClick={() => setIsScannerOpen(true)}
                loading={isLookingUpBarcode}
                disabled={isLookingUpBarcode}
              >
                {isLookingUpBarcode ? 'Looking up...' : 'Scan'}
              </Button>
            )}
          </div>

          <div className="p-4 border-t">
            <Button variant="secondary" onClick={handleClose} className="">
              Close
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Barcode Scanner Drawer */}
      {isScannerOpen && (
        <BarcodeScanner
          onClose={handleClose}
          onCloseScanner={() => {
            setIsScannerOpen(false)
          }}
          isOpen={isScannerOpen}
          onScan={handleBarcodeScanned}
          isProcessing={isLookingUpBarcode}
        />
      )}
    </>
  )
}
