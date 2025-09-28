import { Salad } from 'lucide-react'

import { Input } from '@/components/ui/input'
import type { GQLGetNutritionPlanQuery } from '@/generated/graphql-client'

interface EditableIngredientsListProps {
  meal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]['meal']
  planMeal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]
  ingredientGrams: Record<string, string>
  onIngredientChange: (ingredientId: string, value: string) => void
  onIngredientFormat: (ingredientId: string, value: string) => void
}

export function EditableIngredientsList({
  meal,
  planMeal,
  ingredientGrams,
  onIngredientChange,
  onIngredientFormat,
}: EditableIngredientsListProps) {
  return (
    <div className="">
      <div className="flex items-center gap-2 mb-3">
        <Salad className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">Ingredients</h4>
      </div>
      {meal.ingredients && meal.ingredients.length > 0 ? (
        <div className="space-y-2">
          {meal.ingredients.map((mealIngredient) => {
            const ingredient = mealIngredient.ingredient
            // Use override grams if available, otherwise blueprint grams
            const override = planMeal.ingredientOverrides?.find(
              (o) => o.mealIngredient.id === mealIngredient.id,
            )
            const currentGrams = override?.grams ?? mealIngredient.grams
            const inputValue =
              ingredientGrams[mealIngredient.id] ?? currentGrams.toString()

            // Calculate macros based on current display grams
            const displayGrams = parseFloat(inputValue) || currentGrams
            const calories = Math.round(
              (ingredient.caloriesPer100g * displayGrams) / 100,
            )
            const protein = Math.round(
              (ingredient.proteinPer100g * displayGrams) / 100,
            )
            const carbs = Math.round(
              (ingredient.carbsPer100g * displayGrams) / 100,
            )
            const fat = Math.round((ingredient.fatPer100g * displayGrams) / 100)

            return (
              <div
                key={mealIngredient.id}
                className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{ingredient.name}</span>
                  <div className="flex items-center gap-1">
                    <Input
                      id={`ingredient-${mealIngredient.id}`}
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        e.stopPropagation()
                        onIngredientChange(mealIngredient.id, e.target.value)
                      }}
                      onFocus={(e) => {
                        e.stopPropagation()
                        e.target.select() // Select all text on focus
                      }}
                      onBlur={(e) => {
                        e.stopPropagation()
                        onIngredientFormat(mealIngredient.id, e.target.value)
                      }}
                      className="w-16 h-6 text-xs text-right"
                      inputMode="decimal" // Show numeric keypad on mobile
                    />
                    <span className="text-xs text-muted-foreground">g</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm ml-auto">
                  <span>{calories} kcal</span>
                  <span className="text-green-600">P: {protein}g</span>
                  <span className="text-blue-600">C: {carbs}g</span>
                  <span className="text-yellow-600">F: {fat}g</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          No ingredients in this meal
        </div>
      )}
    </div>
  )
}
