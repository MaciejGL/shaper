'use client'

import { ScanBarcodeIcon, SearchIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { FoodSearchLoading } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-loading'
import { FoodSearchResults } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-results'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchResult } from '@/lib/food-search'
import { createTimestampWithDateAndCurrentTime } from '@/lib/utc-date-utils'
import { cn } from '@/lib/utils'

import { SelectedMeal } from './meal-logging-drawer'
import { ScannedFoodResult } from './scanned-food-result'
import { useMealLogging } from './use-meal-logging'

interface CustomFoodSearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  mealId: string
  onFoodAdded?: () => void
  selectedMeal?: SelectedMeal | null
  onShowMeal: () => void
}

export function CustomFoodSearchDrawer({
  isOpen,
  onClose,
  mealId,
  onFoodAdded,
  selectedMeal,
  onShowMeal,
}: CustomFoodSearchDrawerProps) {
  const { handleRemoveLogItem, handleAddCustomFood } = useMealLogging()
  const [date] = useQueryState('date') // Get current date from URL
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 750) // Increased debounce for fewer API calls
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false)
  const [scannedFood, setScannedFood] = useState<SearchResult | null>(null)
  const [barcode, setBarcode] = useState<string | null>(null)

  // Ref to track current search request so we can abort it if user types again
  const currentSearchController = useRef<AbortController | null>(null)
  // Search foods using the API route (server-side) with abort signal support
  // API now returns SearchResult[] directly - no conversion needed!
  const searchFoodsAPI = async (
    query: string,
    signal?: AbortSignal,
  ): Promise<SearchResult[]> => {
    const response = await fetch(
      `/api/food/search?q=${encodeURIComponent(query)}`,
      {
        signal, // Pass abort signal to cancel request if needed
      },
    )
    if (!response.ok) {
      throw new Error('API search failed')
    }

    const searchResults: SearchResult[] = await response.json()
    return searchResults
  }

  // Handle search with request cancellation
  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Cancel any ongoing search request
    if (currentSearchController.current) {
      currentSearchController.current.abort()
    }

    // Create new abort controller for this search
    const controller = new AbortController()
    currentSearchController.current = controller

    setIsSearching(true)
    try {
      const results = await searchFoodsAPI(term, controller.signal)

      // Only update results if this request wasn't aborted
      if (!controller.signal.aborted) {
        setSearchResults(results || [])
      }
    } catch (error) {
      // Don't show error if request was just aborted (user typed again)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('🔄 Search request aborted - user typed again')
        return
      }

      console.error('❌ Search error:', error)
      toast.error('Failed to search foods')
    } finally {
      // Only set loading to false if this request wasn't aborted
      if (!controller.signal.aborted) {
        setScannedFood(null)
        setIsLookingUpBarcode(false)
        setIsSearching(false)
      }

      // Clean up controller reference if it's still the current one
      if (currentSearchController.current === controller) {
        currentSearchController.current = null
      }
    }
  }, [])

  // Handle barcode scan result
  const handleBarcodeScanned = async (barcode: string) => {
    try {
      setIsLookingUpBarcode(true)
      setBarcode(barcode)

      // Look up product using existing API endpoint
      const response = await fetch(`/api/food/search?barcode=${barcode}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup product')
      }

      const product = data.product
      if (!product) {
        toast.error('Product not found. Please try searching manually.')
        return
      }

      // Create SearchResult object from database product
      const foodItem: SearchResult = {
        name: product.name || 'Unknown Product',
        source: 'openfoodfacts',
        caloriesPer100g: product.caloriesPer100g || 0,
        proteinPer100g: product.proteinPer100g || 0,
        carbsPer100g: product.carbsPer100g || 0,
        fatPer100g: product.fatPer100g || 0,
        fiberPer100g: product.fiberPer100g || 0,
        openFoodFactsId: product.code || barcode,
        brands: product.brands,
        servingQuantity: product.servingQuantity,
        servingSize: product.servingSize,
      }

      // Show scanned food in the main search area
      setScannedFood(foodItem)
      // Clear search results to focus on scanned item
      setSearchResults([])
      setSearchTerm('')
      // Clear barcode state since we found a product
      setBarcode(null)
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
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 2) {
      handleSearch(debouncedQuery.trim())
    } else {
      // Clear results and cancel any ongoing search when query is too short
      setSearchResults([])
      setIsSearching(false)
      if (currentSearchController.current) {
        currentSearchController.current.abort()
        currentSearchController.current = null
      }
    }
  }, [debouncedQuery, handleSearch])

  // Cleanup: abort any ongoing search request when component unmounts
  useEffect(() => {
    return () => {
      if (currentSearchController.current) {
        currentSearchController.current.abort()
      }
    }
  }, [])

  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    setScannedFood(null)
    setBarcode(null)
    setIsSearching(false)
    // Cancel any ongoing search when drawer closes
    if (currentSearchController.current) {
      currentSearchController.current.abort()
      currentSearchController.current = null
    }
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
              {/* Show no product found message only when barcode lookup has failed */}
              {barcode && !isLookingUpBarcode && !scannedFood && (
                <div className="text-center text-muted-foreground py-4">
                  No product found for barcode: {barcode}
                </div>
              )}
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
                setSearchResults([])
                setIsSearching(false)
                // Cancel any ongoing search when input is cleared
                if (currentSearchController.current) {
                  currentSearchController.current.abort()
                  currentSearchController.current = null
                }
              }}
            />

            {barcodeEnabled && (
              <Button
                variant="default"
                iconStart={<ScanBarcodeIcon />}
                onClick={() => setIsScannerOpen(true)}
                loading={isLookingUpBarcode}
                disabled={isLookingUpBarcode}
              >
                {isLookingUpBarcode ? 'Looking up...' : 'Scan'}
              </Button>
            )}
          </div>

          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="tertiary" onClick={onShowMeal}>
              View Meal
            </Button>
            <Button variant="tertiary" onClick={handleClose} className="">
              Done
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Barcode Scanner Drawer */}
      {isScannerOpen && (
        <BarcodeScanner
          onClose={() => setIsScannerOpen(false)}
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
