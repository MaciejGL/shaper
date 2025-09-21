'use client'

import { Plus, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  type GQLIngredient,
  type GQLRecentIngredientsQuery,
  type GQLSearchIngredientsQuery,
  useRecentIngredientsQuery,
  useSearchIngredientsQuery,
} from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type SearchIngredient = NonNullable<
  GQLSearchIngredientsQuery['searchIngredients']
>[number]
type RecentIngredient = NonNullable<
  GQLRecentIngredientsQuery['recentIngredients']
>[number]

interface IngredientSearchComboboxProps {
  onIngredientSelected: (ingredient: GQLIngredient) => void
  onCreateIngredient?: (searchQuery: string) => void
  placeholder?: string
  className?: string
}

export function IngredientSearchCombobox({
  onIngredientSelected,
  onCreateIngredient,
  placeholder = 'Search ingredients...',
  className,
}: IngredientSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Debounce search query by 300ms for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Search for ingredients when there's a query
  const { data: searchData } = useSearchIngredientsQuery(
    { query: debouncedSearchQuery, limit: 10 },
    { enabled: debouncedSearchQuery.length > 0 },
  )

  // Get recent ingredients when no search query
  const { data: recentData } = useRecentIngredientsQuery(
    { limit: 10 },
    { enabled: debouncedSearchQuery.length === 0 },
  )

  const availableIngredients = debouncedSearchQuery
    ? searchData?.searchIngredients || []
    : recentData?.recentIngredients || []

  const hasResults = availableIngredients.length > 0
  const isExactMatch = availableIngredients.find(
    (ingredient) =>
      ingredient.name.toLowerCase() === debouncedSearchQuery.toLowerCase(),
  )
  const showCreateButton = debouncedSearchQuery.length > 0 && !isExactMatch
  const showResults = isOpen && (searchQuery.length > 0 || hasResults)

  const handleSelectIngredient = (
    ingredient: SearchIngredient | RecentIngredient,
  ) => {
    onIngredientSelected(ingredient as GQLIngredient)
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    onCreateIngredient?.(debouncedSearchQuery)
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
      e.currentTarget.blur()
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value.length > 0 || hasResults) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.length > 0 || hasResults) setIsOpen(true)
          }}
          onBlur={(e) => {
            // Don't close if clicking on the dropdown itself
            const relatedTarget = e.relatedTarget as HTMLElement
            if (relatedTarget?.closest('#ingredient-search-results')) {
              return
            }
            // Stable delay to prevent flickering
            setTimeout(() => setIsOpen(false), 150)
          }}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          role="combobox"
          aria-controls="ingredient-search-results"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          id="ingredient-search-results"
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
          style={{
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <Command className="rounded-md">
            <CommandList className="max-h-64">
              {/* Recent Ingredients (when no search query) */}
              {!debouncedSearchQuery && hasResults && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
                    Recent ingredients
                  </div>
                  {availableIngredients.map((ingredient) => (
                    <CommandItem
                      key={ingredient.id}
                      className="cursor-pointer data-[selected=true]:bg-accent/50"
                      onSelect={() => handleSelectIngredient(ingredient)}
                    >
                      <div className="flex w-full items-center justify-between py-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">
                            {ingredient.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ingredient.caloriesPer100g} kcal/100g
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectIngredient(ingredient)
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                          }}
                          iconOnly={<Plus />}
                          className="ml-2 shrink-0 h-8 w-8 touch-manipulation"
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Search Results */}
              {debouncedSearchQuery && hasResults && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {availableIngredients.length} ingredient
                    {availableIngredients.length !== 1 ? 's' : ''} found
                  </div>
                  {availableIngredients.map((ingredient) => (
                    <CommandItem
                      key={ingredient.id}
                      className="cursor-pointer data-[selected=true]:bg-accent/50"
                      onSelect={() => handleSelectIngredient(ingredient)}
                    >
                      <div className="flex w-full items-center justify-between py-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">
                            {ingredient.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ingredient.caloriesPer100g} kcal/100g
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectIngredient(ingredient)
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                          }}
                          iconOnly={<Plus />}
                          className="ml-2 shrink-0 h-8 w-8 touch-manipulation"
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* No Results - Create New Option */}
              {showCreateButton && onCreateIngredient && (
                <CommandGroup>
                  <CommandItem
                    className="cursor-pointer"
                    onSelect={handleCreateNew}
                  >
                    <div className="flex w-full items-center justify-center py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                        iconStart={<Plus />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCreateNew()
                        }}
                      >
                        Add new ingredient "{debouncedSearchQuery}"
                      </Button>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Empty States */}
              {!debouncedSearchQuery && !hasResults && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search ingredients
                </div>
              )}

              {debouncedSearchQuery && !hasResults && !showCreateButton && (
                <CommandEmpty className="py-6 text-center text-sm">
                  No ingredients found for "{debouncedSearchQuery}"
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
