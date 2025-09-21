'use client'

import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useAddIngredientToMealMutation,
  useRecentIngredientsQuery,
  useSearchIngredientsQuery,
} from '@/generated/graphql-client'

import { CreateIngredientSheet } from './create-ingredient-components'
import { IngredientSearchResults } from './ingredient-search-results'

interface IngredientSearchSectionProps {
  mealId: string
  onIngredientAdded?: () => void
}

export function IngredientSearchSection({
  mealId,
  onIngredientAdded,
}: IngredientSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch search results when query changes
  const { data: searchData, isLoading: isSearching } =
    useSearchIngredientsQuery(
      { query: searchQuery, limit: 20 },
      { enabled: searchQuery.length > 0 },
    )

  // Fetch recent ingredients when no search query
  const { data: recentData, isLoading: isLoadingRecent } =
    useRecentIngredientsQuery(
      { limit: 10 },
      { enabled: searchQuery.length === 0 },
    )

  const addIngredientMutation = useAddIngredientToMealMutation()

  const handleAddIngredient = async (
    ingredientId: string,
    grams: number = 100,
  ) => {
    try {
      await addIngredientMutation.mutateAsync({
        input: {
          mealId,
          ingredientId,
          grams,
        },
      })
      onIngredientAdded?.()
    } catch (error) {
      console.error('Failed to add ingredient to meal:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const ingredients = searchQuery
    ? searchData?.searchIngredients || []
    : recentData?.recentIngredients || []

  const isLoading = searchQuery ? isSearching : isLoadingRecent

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Add Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="search-ingredients"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                iconStart={<Search />}
              />
            </div>
            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>

          <IngredientSearchResults
            ingredients={ingredients}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAddIngredient={handleAddIngredient}
            isAdding={addIngredientMutation.isPending}
          />
        </div>

        <CreateIngredientSheet
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onIngredientCreated={(ingredient) => {
            handleAddIngredient(ingredient.id)
            setShowCreateDialog(false)
          }}
        />
      </CardContent>
    </Card>
  )
}
