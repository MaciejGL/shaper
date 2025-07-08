import { motion } from 'framer-motion'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import { SearchResult } from './food-search'
import { MacroBadge } from './macro-badge'

export function FoodSearchResults({
  searchResults,
  addFood,
  isSearching,
}: {
  searchResults: SearchResult[]
  addFood: (food: SearchResult) => void
  isSearching: boolean
}) {
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
  return (
    <motion.div variants={variants} className="grid gap-2">
      {searchResults.map((food, index) => (
        <motion.div variants={itemVariants} key={index}>
          <Card key={food.name} className="p-3 dark:bg-card-on-card">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <p className="font-medium">{food.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Per 100g:</p>
                  <MacroBadge
                    macro="calories"
                    value={food.caloriesPer100g || 0}
                  />
                  <MacroBadge
                    macro="protein"
                    value={food.proteinPer100g || 0}
                  />
                  <MacroBadge macro="carbs" value={food.carbsPer100g || 0} />
                  <MacroBadge macro="fat" value={food.fatPer100g || 0} />
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full"
                onClick={() => addFood(food)}
                disabled={isSearching}
                iconOnly={<PlusIcon />}
              >
                Add
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
