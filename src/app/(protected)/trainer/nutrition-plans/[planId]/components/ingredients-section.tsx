'use client'

import { Plus, Search, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Control } from 'react-hook-form'

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
  ingredientFields: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onIngredientAdded: (ingredient: any, grams?: number) => void
  onIngredientRemoved: (index: number) => void
}

export function IngredientsSection({
  control,
  ingredientFields,
  onIngredientAdded,
  onIngredientRemoved,
}: IngredientsSectionProps) {
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showCreateIngredientForm, setShowCreateIngredientForm] =
    useState(false)
  const [justSelected, setJustSelected] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false)
      }
    }

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isPopoverOpen])

  // Search for ingredients
  const { data: searchData } = useSearchIngredientsQuery(
    { query: ingredientSearchQuery, limit: 10 },
    { enabled: ingredientSearchQuery.length > 0 },
  )

  // Get recent ingredients when no search
  const { data: recentData } = useRecentIngredientsQuery(
    { limit: 10 },
    { enabled: ingredientSearchQuery.length === 0 },
  )

  const availableIngredients = ingredientSearchQuery
    ? searchData?.searchIngredients || []
    : recentData?.recentIngredients || []

  const hasResults = availableIngredients.length > 0
  const showNoResults = ingredientSearchQuery.length > 0 && !hasResults

  const handleCreateIngredient = () => {
    setShowCreateIngredientForm(true)
    setIsPopoverOpen(false)
  }

  const handleIngredientCreated = (ingredient: GQLIngredient) => {
    onIngredientAdded(ingredient, 100)
    setShowCreateIngredientForm(false)
    setIngredientSearchQuery('')
    // Refocus input after ingredient creation
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleCancelIngredientCreation = () => {
    setShowCreateIngredientForm(false)
    setIngredientSearchQuery('')
    // Refocus input after canceling
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleAddIngredient = useCallback(
    (ingredient: any) => {
      try {
        onIngredientAdded(ingredient, 100)
        // Set flag to prevent immediate reopening
        setJustSelected(true)
        // Close popover and clear search immediately
        setIsPopoverOpen(false)
        setIngredientSearchQuery('')
        // Refocus the input after selection and clear the flag
        setTimeout(() => {
          setJustSelected(false)
          inputRef.current?.focus()
        }, 300)
      } catch (error) {
        console.error('Error adding ingredient:', error)
      }
    },
    [onIngredientAdded],
  )

  const handleSearchFocus = () => {
    // Don't open if we just selected an ingredient
    if (justSelected) return

    // Only open if we have a search query or if we're showing recent ingredients
    if (
      ingredientSearchQuery.length > 0 ||
      (!ingredientSearchQuery && hasResults)
    ) {
      setIsPopoverOpen(true)
    }
  }

  const handleSearchChange = (value: string) => {
    setIngredientSearchQuery(value)
    if (value.length > 0) {
      setIsPopoverOpen(true)
    } else {
      setIsPopoverOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Ingredients</FormLabel>
      </div>

      {/* Ingredient Search with Popover */}
      <div ref={containerRef} className="relative">
        <Input
          ref={inputRef}
          id="ingredient-search"
          placeholder="Search ingredients..."
          value={ingredientSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleSearchFocus}
          iconStart={<Search />}
        />

        {/* Popover positioned relative to input */}
        {isPopoverOpen && (
          <div
            data-popover-content
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md p-0"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="max-h-48 overflow-y-auto">
              {/* Results List */}
              {hasResults && (
                <div className="p-1">
                  {availableIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      data-ingredient-item
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddIngredient(ingredient)
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {ingredient.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ingredient.caloriesPer100g} kcal/100g
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAddIngredient(ingredient)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results - Create New */}
              {showNoResults && (
                <div className="p-3" data-ingredient-item>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleCreateIngredient()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add new ingredient "{ingredientSearchQuery}"
                  </Button>
                </div>
              )}

              {/* Recent ingredients when no search */}
              {!ingredientSearchQuery && hasResults && (
                <div className="p-1">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    Recent ingredients
                  </div>
                  {availableIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      data-ingredient-item
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleAddIngredient(ingredient)
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {ingredient.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ingredient.caloriesPer100g} kcal/100g
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAddIngredient(ingredient)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for no recent ingredients */}
              {!ingredientSearchQuery && !hasResults && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Start typing to search ingredients
                </div>
              )}
            </div>
          </div>
        )}
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
