'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GQLSearchIngredientsQuery } from '@/generated/graphql-client'

interface IngredientSearchResultsProps {
  ingredients: NonNullable<GQLSearchIngredientsQuery['searchIngredients']>
  isLoading: boolean
  searchQuery: string
  onAddIngredient: (ingredientId: string, grams: number) => void
  isAdding: boolean
}

export function IngredientSearchResults({
  ingredients,
  isLoading,
  searchQuery,
  onAddIngredient,
  isAdding,
}: IngredientSearchResultsProps) {
  const [selectedGrams, setSelectedGrams] = useState<Record<string, number>>({})

  const handleGramsChange = (ingredientId: string, grams: number) => {
    setSelectedGrams((prev) => ({ ...prev, [ingredientId]: grams }))
  }

  const handleAddIngredient = (ingredientId: string) => {
    const grams = selectedGrams[ingredientId] || 100
    onAddIngredient(ingredientId, grams)
  }

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Searching ingredients...
      </div>
    )
  }

  if (ingredients.length === 0 && searchQuery) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No ingredients found for "{searchQuery}"
      </div>
    )
  }

  if (ingredients.length === 0 && !searchQuery) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Recent ingredients will appear here
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">
        {searchQuery
          ? `Search results (${ingredients.length})`
          : `Recent ingredients (${ingredients.length})`}
      </div>

      {ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-1">
            <div className="font-medium">{ingredient.name}</div>
            <div className="text-sm text-muted-foreground">
              Per 100g: {ingredient.caloriesPer100g} kcal | P:{' '}
              {ingredient.proteinPer100g}g | C: {ingredient.carbsPer100g}g | F:{' '}
              {ingredient.fatPer100g}g
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Label htmlFor={`grams-${ingredient.id}`} className="text-xs">
                Grams:
              </Label>
              <Input
                id={`grams-${ingredient.id}`}
                type="number"
                min="1"
                max="2000"
                className="w-20 h-8 text-sm"
                value={selectedGrams[ingredient.id] || 100}
                onChange={(e) =>
                  handleGramsChange(
                    ingredient.id,
                    Number(e.target.value) || 100,
                  )
                }
              />
            </div>

            <Button
              size="sm"
              disabled={isAdding}
              onClick={() => handleAddIngredient(ingredient.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
