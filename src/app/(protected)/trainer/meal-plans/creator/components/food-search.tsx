'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, XIcon } from 'lucide-react'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import {
  type EditableFood,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'
import { useDebounce } from '@/hooks/use-debounce'
import { SearchResult } from '@/lib/food-search'

import { FoodSearchLoading } from './food-search-loading'
import { FoodSearchResults } from './food-search-results'

// ============================================================================
// SEARCH FUNCTION (Simplified - API returns SearchResult[] directly)
// ============================================================================

/**
 * Search foods using the API route (server-side) with abort signal support
 * API now returns SearchResult[] directly - no conversion needed!
 */
async function searchFoodsAPI(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const response = await fetch(
    `/api/food/search?q=${encodeURIComponent(query)}`,
    {
      signal, // Pass abort signal to cancel request if needed
    },
  )

  if (!response.ok) {
    throw new Error('API search failed')
  }

  const data = await response.json()
  return data
}

// ============================================================================
// COMPONENT
// ============================================================================

interface FoodSearchProps {
  dayId: string
  hour: number
  onClose: () => void
  foods: EditableFood[]
  setFoods: Dispatch<SetStateAction<EditableFood[]>>
  setHasChanges: Dispatch<SetStateAction<boolean>>
  canEdit: boolean
}

export default function FoodSearch({
  dayId,
  hour,
  foods,
  setFoods,
  setHasChanges,
  canEdit,
}: FoodSearchProps) {
  const { getMealByHour } = useMealPlanContext()

  // Local state for editing
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedQuery = useDebounce(searchTerm, 750) // Increased debounce for fewer API calls
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Ref to track current search request so we can abort it if user types again
  const currentSearchController = useRef<AbortController | null>(null)

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
      if (!canEdit) {
        toast.error('You do not have permission to add foods')
        return
      }

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
      setIsSearching(false)
      // Cancel any ongoing search when food is added
      if (currentSearchController.current) {
        currentSearchController.current.abort()
        currentSearchController.current = null
      }
    },
    [canEdit, foods, setFoods, setHasChanges],
  )

  // Handle search using API route (server-side) with request cancellation
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

      console.error('❌ Client search error:', error)
      toast.error('Failed to search foods')
    } finally {
      // Only set loading to false if this request wasn't aborted
      if (!controller.signal.aborted) {
        setIsSearching(false)
      }

      // Clean up controller reference if it's still the current one
      if (currentSearchController.current === controller) {
        currentSearchController.current = null
      }
    }
  }, [])

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
        placeholder={canEdit ? 'Search for foods...' : 'View foods (read-only)'}
        variant="secondary"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
        }}
        iconStart={<Search />}
        iconEnd={
          <XIcon
            className="cursor-pointer"
            onClick={() => {
              setSearchTerm('')
              setSearchResults([])
              setIsSearching(false)
              // Cancel any ongoing search when user manually clears
              if (currentSearchController.current) {
                currentSearchController.current.abort()
                currentSearchController.current = null
              }
            }}
          />
        }
        disabled={!canEdit}
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
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
