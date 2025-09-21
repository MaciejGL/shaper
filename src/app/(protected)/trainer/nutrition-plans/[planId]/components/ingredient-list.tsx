'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { GQLGetNutritionPlanQuery } from '@/generated/graphql-client'

import { IngredientSearchSection } from './ingredient-search-section'

interface IngredientListProps {
  ingredients: NonNullable<
    NonNullable<
      GQLGetNutritionPlanQuery['nutritionPlan']
    >['days'][number]['meals'][number]['meal']
  >['ingredients']
  portionMultiplier: number
  mealId: string
  onIngredientAdded?: () => void
}

export function IngredientList({
  ingredients,
  portionMultiplier,
  mealId,
  onIngredientAdded,
}: IngredientListProps) {
  const [showIngredientSearch, setShowIngredientSearch] = useState(false)

  const handleIngredientAdded = () => {
    onIngredientAdded?.()
    setShowIngredientSearch(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Ingredients:</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowIngredientSearch(!showIngredientSearch)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {/* Ingredient Search Section */}
      {showIngredientSearch && (
        <IngredientSearchSection
          mealId={mealId}
          onIngredientAdded={handleIngredientAdded}
        />
      )}

      {/* Existing Ingredients */}
      {ingredients.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No ingredients added yet
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((mealIngredient) => {
            const ingredient = mealIngredient.ingredient
            const adjustedGrams = mealIngredient.grams * portionMultiplier

            // Calculate macros based on adjusted grams
            const calories = Math.round(
              (ingredient.caloriesPer100g * adjustedGrams) / 100,
            )
            const protein = Math.round(
              (ingredient.proteinPer100g * adjustedGrams) / 100,
            )
            const carbs = Math.round(
              (ingredient.carbsPer100g * adjustedGrams) / 100,
            )
            const fat = Math.round(
              (ingredient.fatPer100g * adjustedGrams) / 100,
            )

            return (
              <div
                key={mealIngredient.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <span className="font-medium">{ingredient.name}</span>
                  <div className="text-sm text-muted-foreground">
                    {adjustedGrams}g
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span>{calories} kcal</span>
                  <span className="text-muted-foreground">P: {protein}g</span>
                  <span className="text-muted-foreground">C: {carbs}g</span>
                  <span className="text-muted-foreground">F: {fat}g</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
