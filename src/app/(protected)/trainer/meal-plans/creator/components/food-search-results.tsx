import { motion } from 'framer-motion'
import { PlusIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MealTotals } from '@/app/(protected)/fitspace/meal-plan/components/meal-card'
import { SelectedMeal } from '@/app/(protected)/fitspace/meal-plan/components/meal-logging-drawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SearchResult } from '@/lib/food-search'

type FoodSearchResultsProps = {
  searchResults: SearchResult[]
  addFood: (food: SearchResult) => void
  removeFood?: (foodId: string) => void
  selectedMeal?: SelectedMeal | null
  recentlyAddedFoods?: Set<string>
}

export function FoodSearchResults({
  searchResults,
  addFood,
  removeFood,
  selectedMeal,
  recentlyAddedFoods,
}: FoodSearchResultsProps) {
  const variants = {
    enter: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  }

  const commonFoods = useMemo(() => {
    return searchResults.filter((food) => {
      return food.source === 'usda'
    })
  }, [searchResults])

  const productFoods = useMemo(() => {
    return searchResults.filter((food) => {
      return food.source === 'openfoodfacts'
    })
  }, [searchResults])

  return (
    <motion.div variants={variants} className="space-y-2">
      {commonFoods.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Common</h2>
          <div className="space-y-2 bg-card-on-card p-2 rounded-lg -mx-2 px-2">
            {commonFoods.map((food, index) => (
              <FoodCard
                key={food.name + index}
                food={food}
                index={index}
                selectedMeal={selectedMeal}
                recentlyAddedFoods={recentlyAddedFoods}
                removeFood={removeFood}
                addFood={addFood}
              />
            ))}
          </div>
        </div>
      )}
      {productFoods.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Products</h2>
          <div className="space-y-2 bg-card-on-card p-2 rounded-lg -mx-2 px-2">
            {productFoods.map((food, index) => (
              <FoodCard
                key={food.name + index}
                food={food}
                index={index}
                selectedMeal={selectedMeal}
                recentlyAddedFoods={recentlyAddedFoods}
                removeFood={removeFood}
                addFood={addFood}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

const FoodCard = ({
  food,
  index,
  selectedMeal,
  recentlyAddedFoods,
  removeFood,
  addFood,
}: {
  food: SearchResult
  index: number
  selectedMeal: SelectedMeal | null | undefined
  recentlyAddedFoods: Set<string> | undefined
  removeFood?: (foodId: string) => void
  addFood: (food: SearchResult) => void
}) => {
  const [loadingIds, setLoadingIds] = useState<string[]>([])

  const selectedFoodOPId = selectedMeal?.foods.find(
    (f) => f.openFoodFactsId === food.openFoodFactsId,
  )?.openFoodFactsId
  const foodId = food.openFoodFactsId || food.name
  const isAlreadyInMeal = selectedFoodOPId
  const isRecentlyAdded = recentlyAddedFoods?.has(foodId)

  const itemVariants = {
    enter: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.97,
    },
  }

  return (
    <motion.div variants={itemVariants} key={index}>
      <Card key={food.name} className="p-3 dark:bg-card-on-card">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-3 w-full">
            <div className="grid grid-cols-[1fr_auto] items-center overflow-hidden gap-2">
              <p className="font-medium truncate text-sm">{food.name}</p>
              <div>
                {(isAlreadyInMeal || isRecentlyAdded) && removeFood ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="self-start"
                    onClick={async () => {
                      const selectedFood = selectedMeal?.foods.find(
                        (f) => f.openFoodFactsId === food.openFoodFactsId,
                      )
                      if (selectedFood) {
                        setLoadingIds((prev) => [...prev, selectedFood.id])
                        await removeFood(selectedFood.id)
                      }

                      setLoadingIds((prev) =>
                        prev.filter((id) => id !== selectedFood?.id),
                      )
                    }}
                    loading={loadingIds.includes(selectedFoodOPId || '')}
                    iconOnly={<XIcon />}
                  />
                ) : (
                  <Button
                    size="sm"
                    className="self-start"
                    onClick={async () => {
                      setLoadingIds((prev) => [...prev, foodId])
                      await addFood(food)
                      setLoadingIds((prev) =>
                        prev.filter((id) => id !== foodId),
                      )
                    }}
                    loading={loadingIds.includes(foodId)}
                    iconOnly={<PlusIcon />}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Per 100g:</p>
                <MealTotals
                  plannedTotals={{
                    calories: food.caloriesPer100g || 0,
                    protein: food.proteinPer100g || 0,
                    carbs: food.carbsPer100g || 0,
                    fat: food.fatPer100g || 0,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
