'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { GQLGetMealsForLibraryQuery } from '@/generated/graphql-client'
import { useCookingUnits } from '@/lib/cooking-units'

type Meal = NonNullable<GQLGetMealsForLibraryQuery['teamMeals']>[number]

// Total Macros Display Component
function TotalMacrosDisplay({
  calories,
  protein,
  carbs,
  fat,
}: {
  calories: number
  protein: number
  carbs: number
  fat: number
}) {
  return (
    <div className="grid grid-cols-4 mt-2 border border-border rounded-lg overflow-hidden">
      <div className="text-center p-3 border-r border-border/50">
        <div className="text-lg font-semibold text-primary">
          {Math.round(calories)}
        </div>
        <div className="text-xs text-muted-foreground">calories</div>
      </div>
      <div className="text-center p-3 border-r border-border/50">
        <div className="text-lg font-semibold text-green-600">
          {Math.round(protein)}g
        </div>
        <div className="text-xs text-muted-foreground">protein</div>
      </div>
      <div className="text-center p-3 border-r border-border/50">
        <div className="text-lg font-semibold text-blue-600">
          {Math.round(carbs)}g
        </div>
        <div className="text-xs text-muted-foreground">carbs</div>
      </div>
      <div className="text-center p-3">
        <div className="text-lg font-semibold text-yellow-600">
          {Math.round(fat)}g
        </div>
        <div className="text-xs text-muted-foreground">fat</div>
      </div>
    </div>
  )
}

interface ViewMealDrawerProps {
  meal: Meal
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewMealDrawer({
  meal,
  open,
  onOpenChange,
}: ViewMealDrawerProps) {
  const { formatIngredient } = useCookingUnits()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{meal.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6 p-4">
          {/* Basic Info */}
          {meal.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {meal.description}
              </p>
            </div>
          )}

          {/* Servings */}
          {meal.servings && (
            <div>
              <h3 className="text-sm font-medium mb-2">Servings</h3>
              <p className="text-sm text-muted-foreground">{meal.servings}</p>
            </div>
          )}

          {/* Total Macros */}
          <div>
            <h3 className="text-sm font-medium mb-2">Total Nutrition</h3>
            <TotalMacrosDisplay
              calories={meal.totalMacros.calories}
              protein={meal.totalMacros.protein}
              carbs={meal.totalMacros.carbs}
              fat={meal.totalMacros.fat}
            />
          </div>

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">
                Ingredients ({meal.ingredients.length})
              </h3>
              <div className="space-y-2">
                {meal.ingredients
                  .sort((a, b) => a.order - b.order)
                  .map((ingredientItem) => (
                    <div
                      key={ingredientItem.id}
                      className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm font-medium flex-1">
                        {ingredientItem.ingredient.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatIngredient(
                          ingredientItem.grams,
                          ingredientItem.ingredient.name,
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {meal.instructions && meal.instructions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Instructions</h3>
              <div className="space-y-3">
                {meal.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
