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
import { SearchResult, searchFoods } from '@/lib/food-search'

import { FoodSearchLoading } from './food-search-loading'
import { FoodSearchResults } from './food-search-results'

interface FoodSearchProps {
  dayId: string
  hour: number
  onClose: () => void
  foods: EditableFood[]
  setFoods: Dispatch<SetStateAction<EditableFood[]>>
  setHasChanges: Dispatch<SetStateAction<boolean>>
  canEdit: boolean
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
  canEdit,
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
    },
    [canEdit, foods, setFoods, setHasChanges, setSearchTerm, setSearchResults],
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
        placeholder={canEdit ? 'Search for foods...' : 'View foods (read-only)'}
        variant="secondary"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
        }}
        iconStart={<Search />}
        iconEnd={
          <XIcon className="cursor-pointer" onClick={() => setSearchTerm('')} />
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
              isSearching={isSearching}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
