'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Control, useFieldArray } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  type GQLIngredient,
  useRecentIngredientsQuery,
  useSearchIngredientsQuery,
} from '@/generated/graphql-client'

import { InlineIngredientForm } from './inline-ingredient-form'

interface IngredientsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onIngredientAdded: (ingredient: any, grams?: number) => void
  onIngredientRemoved: (index: number) => void
}

export function IngredientsSection({
  control,
  onIngredientAdded,
  onIngredientRemoved,
}: IngredientsSectionProps) {
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('')
  const [showIngredientSearch, setShowIngredientSearch] = useState(false)
  const [showCreateIngredientForm, setShowCreateIngredientForm] =
    useState(false)

  const { fields: ingredientFields } = useFieldArray({
    control,
    name: 'ingredients',
  })

  // Search for ingredients
  const { data: searchData } = useSearchIngredientsQuery(
    { query: ingredientSearchQuery, limit: 10 },
    { enabled: ingredientSearchQuery.length > 0 },
  )

  // Get recent ingredients when no search
  const { data: recentData } = useRecentIngredientsQuery(
    { limit: 10 },
    { enabled: ingredientSearchQuery.length === 0 && showIngredientSearch },
  )

  const availableIngredients = ingredientSearchQuery
    ? searchData?.searchIngredients || []
    : recentData?.recentIngredients || []

  const handleCreateIngredient = () => {
    // Pre-fill the ingredient name from search query
    if (ingredientSearchQuery) {
      // The InlineIngredientForm will handle setting the name
    }
    setShowCreateIngredientForm(true)
    setShowIngredientSearch(false)
  }

  const handleIngredientCreated = (ingredient: GQLIngredient) => {
    onIngredientAdded(ingredient, 100)
    setShowCreateIngredientForm(false)
    setIngredientSearchQuery('')
  }

  const handleCancelIngredientCreation = () => {
    setShowCreateIngredientForm(false)
    setIngredientSearchQuery('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Ingredients</FormLabel>
      </div>

      {/* Selected Ingredients List */}
      {ingredientFields.length > 0 && (
        <div className="space-y-2">
          {ingredientFields.map((field, index: number) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <div className="font-medium text-sm">{(field as any).name}</div>
              </div>
              <div className="flex items-center gap-2">
                <FormField
                  control={control}
                  name={`ingredients.${index}.grams`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-1">
                          <Input
                            id={`ingredient-${index}-grams`}
                            type="number"
                            min="1"
                            className="w-20"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 1)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            g
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onIngredientRemoved(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ingredient Search */}
      {showIngredientSearch && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <Input
            id="ingredient-search"
            placeholder="Search ingredients..."
            value={ingredientSearchQuery}
            onChange={(e) => setIngredientSearchQuery(e.target.value)}
            iconStart={<Plus />}
          />

          {availableIngredients.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {availableIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                  onClick={() => onIngredientAdded(ingredient)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ingredient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ingredient.caloriesPer100g} kcal/100g
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onIngredientAdded(ingredient, 100)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {ingredientSearchQuery && availableIngredients.length === 0 && (
            <div className="text-center py-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                No ingredients found for "{ingredientSearchQuery}"
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCreateIngredient}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create "{ingredientSearchQuery}"
              </Button>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-max mx-auto"
        onClick={() => setShowIngredientSearch(!showIngredientSearch)}
        iconStart={<Plus />}
      >
        Add Ingredient
      </Button>

      {/* Inline Ingredient Creation Form */}
      <InlineIngredientForm
        show={showCreateIngredientForm}
        defaultName={ingredientSearchQuery}
        onIngredientCreated={handleIngredientCreated}
        onCancel={handleCancelIngredientCreation}
      />
    </div>
  )
}
