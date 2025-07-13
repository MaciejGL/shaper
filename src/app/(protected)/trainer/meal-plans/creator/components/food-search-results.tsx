import { motion } from 'framer-motion'
import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import { SelectedMeal } from '@/app/(protected)/fitspace/meal-plan/components/meal-logging-drawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SearchResult } from '@/lib/food-search'

import { MacroBadge } from './macro-badge'

type FoodSearchResultsProps = {
  searchResults: SearchResult[]
  addFood: (food: SearchResult) => void
  removeFood?: (foodId: string) => void
  selectedMeal?: SelectedMeal | null
}

export function FoodSearchResults({
  searchResults,
  addFood,
  removeFood,
  selectedMeal,
}: FoodSearchResultsProps) {
  const [loadingIds, setLoadingIds] = useState<string[]>([])
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

  console.log(searchResults)

  return (
    <motion.div variants={variants} className="space-y-2">
      {searchResults.map((food, index) => {
        const selectedFoodOPId = selectedMeal?.foods.find(
          (f) => f.openFoodFactsId === food.openFoodFactsId,
        )?.openFoodFactsId
        const foodId = food.openFoodFactsId || food.name
        const isAlreadyInMeal = selectedFoodOPId
        return (
          <motion.div variants={itemVariants} key={index}>
            <Card key={food.name} className="p-3 dark:bg-card-on-card">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-3 w-full">
                  <div className="grid grid-cols-[1fr_auto] items-center overflow-hidden gap-2">
                    <p className="font-medium truncate text-sm">{food.name}</p>
                    <div>
                      {isAlreadyInMeal && removeFood ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="self-start"
                          onClick={async () => {
                            const selectedFood = selectedMeal?.foods.find(
                              (f) => f.openFoodFactsId === food.openFoodFactsId,
                            )
                            if (selectedFood) {
                              setLoadingIds((prev) => [
                                ...prev,
                                selectedFood.id,
                              ])
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Per 100g:</p>
                    <MacroBadge
                      macro="calories"
                      size="sm"
                      value={food.caloriesPer100g || 0}
                    />
                    <MacroBadge
                      macro="protein"
                      size="sm"
                      value={food.proteinPer100g || 0}
                    />
                    <MacroBadge
                      macro="carbs"
                      size="sm"
                      value={food.carbsPer100g || 0}
                    />
                    <MacroBadge
                      macro="fat"
                      size="sm"
                      value={food.fatPer100g || 0}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
