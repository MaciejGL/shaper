'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Control, FieldArrayWithId } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { GQLIngredient } from '@/generated/graphql-client'

import { CreateCustomMealForm } from './create-custom-meal-dialog'
import { IngredientSearchCombobox } from './ingredient-search-combobox'
import { InlineIngredientForm } from './inline-ingredient-form'

type IngredientField = FieldArrayWithId<
  CreateCustomMealForm,
  'ingredients',
  'id'
>

interface IngredientsSectionProps {
  control: Control<CreateCustomMealForm>
  ingredientFields: IngredientField[]
  onIngredientAdded: (ingredient: GQLIngredient, grams?: number) => void
  onIngredientRemoved: (index: number) => void
}

export function IngredientsSection({
  control,
  ingredientFields,
  onIngredientAdded,
  onIngredientRemoved,
}: IngredientsSectionProps) {
  const [showCreateIngredientForm, setShowCreateIngredientForm] =
    useState(false)
  const [createIngredientName, setCreateIngredientName] = useState('')

  const handleIngredientSelected = (ingredient: GQLIngredient) => {
    onIngredientAdded(ingredient, 100)
  }

  const handleCreateIngredient = (searchQuery: string) => {
    setCreateIngredientName(searchQuery)
    setShowCreateIngredientForm(true)
  }

  const handleIngredientCreated = (ingredient: GQLIngredient) => {
    onIngredientAdded(ingredient, 100)
    setShowCreateIngredientForm(false)
    setCreateIngredientName('')
  }

  const handleCancelIngredientCreation = () => {
    setShowCreateIngredientForm(false)
    setCreateIngredientName('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Ingredients</FormLabel>
      </div>

      {/* Ingredient Search */}
      <IngredientSearchCombobox
        onIngredientSelected={handleIngredientSelected}
        onCreateIngredient={handleCreateIngredient}
        placeholder="Search ingredients..."
      />
      {/* Selected Ingredients List */}
      {ingredientFields.length > 0 && (
        <div className="space-y-2">
          {ingredientFields.map((field, index: number) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{field.name}</div>
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

      {/* Inline Ingredient Creation Form */}
      {showCreateIngredientForm && (
        <InlineIngredientForm
          show={showCreateIngredientForm}
          defaultName={createIngredientName}
          onIngredientCreated={handleIngredientCreated}
          onCancel={handleCancelIngredientCreation}
        />
      )}
    </div>
  )
}
