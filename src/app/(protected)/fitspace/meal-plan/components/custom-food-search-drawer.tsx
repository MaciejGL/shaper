'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { FoodSearchLoading } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-loading'
import { FoodSearchResults } from '@/app/(protected)/trainer/meal-plans/creator/components/food-search-results'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  useAddCustomFoodToMealMutation,
  useGetActiveMealPlanQuery,
  useGetDefaultMealPlanQuery,
} from '@/generated/graphql-client'
import { SearchResult, searchFoods } from '@/lib/food-search'
import { createTimestampWithDateAndCurrentTime } from '@/lib/utc-date-utils'

import { SelectedMeal } from './meal-logging-drawer'
import { useMealLogging } from './use-meal-logging'

interface CustomFoodSearchDrawerProps {
  isOpen: boolean
  onClose: () => void
  mealId: string
  onFoodAdded?: () => void
  selectedMeal?: SelectedMeal | null
}

// Local useDebounce implementation (copied from food-search.tsx)
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

export function CustomFoodSearchDrawer({
  isOpen,
  onClose,
  mealId,
  onFoodAdded,
  selectedMeal,
}: CustomFoodSearchDrawerProps) {
  const { handleRemoveLogItem } = useMealLogging()
  const [date] = useQueryState('date') // Get current date from URL
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  // Track which specific food item is being added

  const queryClient = useQueryClient()

  // Use the appropriate mutation hooks
  const { mutateAsync: addCustomFoodToMeal } = useAddCustomFoodToMealMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useGetActiveMealPlanQuery.getKey(),
      })
      queryClient.invalidateQueries({
        queryKey: useGetDefaultMealPlanQuery.getKey(),
      })
      onFoodAdded?.()
    },
    onError: (error) => {
      console.error('Error adding food to meal:', error)
      toast.error('Failed to add food to meal')
    },
  })

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

  // Handle adding food to meal
  const addFood = async (foodItem: SearchResult) => {
    // Set which food item is being added

    try {
      // Add directly to the current meal (Personal Food Log)
      await addCustomFoodToMeal({
        input: {
          mealId,
          name: foodItem.name,
          quantity: 100, // Default to 100g
          unit: 'g',
          caloriesPer100g: foodItem.caloriesPer100g,
          proteinPer100g: foodItem.proteinPer100g,
          carbsPer100g: foodItem.carbsPer100g,
          fatPer100g: foodItem.fatPer100g,
          fiberPer100g: foodItem.fiberPer100g,
          openFoodFactsId: foodItem.openFoodFactsId,
          loggedAt: createTimestampWithDateAndCurrentTime(date), // Date being viewed + current time
        },
      })
    } catch (error) {
      // Error handling is already done in the hook's onError callback
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
    onClose()
  }

  return (
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
            <Input
              id="food-search"
              placeholder="Search for foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              onFocusCapture={() => {
                setSearchTerm('')
              }}
            />

            {isSearching && <FoodSearchLoading />}

            {searchResults.length > 0 && (
              <FoodSearchResults
                searchResults={searchResults}
                addFood={addFood}
                removeFood={handleRemoveLogItem}
                selectedMeal={selectedMeal}
              />
            )}

            {debouncedQuery.length > 2 &&
              !isSearching &&
              searchResults.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No foods found. Try a different search term.
                </div>
              )}

            {searchTerm.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Start typing to search for foods...
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <Button variant="secondary" onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
