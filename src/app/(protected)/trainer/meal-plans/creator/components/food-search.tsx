'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, XIcon } from 'lucide-react'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import {
  type EditableFood,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'

import { FoodSearchLoading } from './food-search-loading'
import { FoodSearchResults } from './food-search-results'

interface FoodSearchProps {
  dayId: string
  hour: number
  onClose: () => void
  foods: EditableFood[]
  setFoods: Dispatch<SetStateAction<EditableFood[]>>
  setHasChanges: Dispatch<SetStateAction<boolean>>
}

// Types for OpenFoodFacts API response
interface OpenFoodFactsProduct {
  product_name: string
  code: string
  nutriments?: {
    'energy-kcal_100g'?: number | string
    proteins_100g?: number | string
    carbohydrates_100g?: number | string
    fat_100g?: number | string
    fiber_100g?: number | string
  }
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[]
}

// Type for search results displayed in UI
export interface SearchResult {
  name: string
  openFoodFactsId: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
}

// Simple food search using the existing API
async function searchFoods(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return []

  try {
    const response = await fetch(
      `/api/food/search?q=${encodeURIComponent(query)}`,
    )
    if (!response.ok) throw new Error('Search failed')

    const data: OpenFoodFactsSearchResponse = await response.json()
    return (
      data.products?.map(
        (product: OpenFoodFactsProduct): SearchResult => ({
          name: product.product_name,
          openFoodFactsId: product.code,
          // Convert all nutrition values to numbers explicitly
          caloriesPer100g:
            Number(product.nutriments?.['energy-kcal_100g']) || 0,
          proteinPer100g: Number(product.nutriments?.proteins_100g) || 0,
          carbsPer100g: Number(product.nutriments?.carbohydrates_100g) || 0,
          fatPer100g: Number(product.nutriments?.fat_100g) || 0,
          fiberPer100g: Number(product.nutriments?.fiber_100g) || 0,
        }),
      ) || []
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

export default function FoodSearch({
  dayId,
  hour,
  foods,
  setFoods,
  setHasChanges,
}: FoodSearchProps) {
  const { getMealByHour } = useMealPlanContext()

  // Local state for editing
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
  }, [dayId, hour, getMealByHour, setFoods])

  // Add food to local state
  const addFood = useCallback(
    (foodItem: SearchResult) => {
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
    [foods, setFoods, setHasChanges, setSearchTerm, setSearchResults],
  )

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

  const variants = {
    enter: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  }

  return (
    <div className="flex flex-col pb-4 space-y-4">
      <Input
        id="food-search"
        placeholder="Search for foods..."
        variant="secondary"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
        }}
        iconStart={<Search />}
        iconEnd={
          <XIcon className="cursor-pointer" onClick={() => setSearchTerm('')} />
        }
      />

      {isSearching && <FoodSearchLoading />}
      <AnimatePresence>
        <motion.div
          variants={variants}
          initial="exit"
          animate="enter"
          exit="exit"
          className="grid gap-2 mb-6"
        >
          {searchResults.length > 0 && (
            <FoodSearchResults
              searchResults={searchResults}
              addFood={addFood}
              isSearching={isSearching}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
