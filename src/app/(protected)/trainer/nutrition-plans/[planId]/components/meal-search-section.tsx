'use client'

import { ChefHat, Plus, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTeamMealsQuery } from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'

import { CreateCustomMealDrawer } from './create-custom-meal-dialog'
import { MealSearchResults } from './meal-search-results'

interface MealSearchSectionProps {
  dayId: string
  nutritionPlanId: string
}

export function MealSearchSection({
  dayId,
  nutritionPlanId,
}: MealSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Debounce search query by 300ms
  const debouncedSearchQuery = useDebounce(searchQuery, 700)

  // Only search when we have a meaningful query (2+ characters)
  const { data, isLoading } = useTeamMealsQuery(
    { searchQuery: debouncedSearchQuery || undefined },
    {
      enabled: debouncedSearchQuery.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const handleCreateCustomMeal = () => {
    setShowCreateDialog(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  const handleMealAdded = () => {
    setSearchQuery('')
    setIsPopoverOpen(false)
  }

  const handleCustomMealCreated = () => {
    // Query invalidation is now handled in the CreateCustomMealDialog component
    console.info('Custom meal created for day:', dayId)
  }

  // Auto-open popover when we have results
  React.useEffect(() => {
    if (
      debouncedSearchQuery.length >= 2 &&
      (data?.teamMeals?.length ?? 0) > 0
    ) {
      setIsPopoverOpen(true)
    } else {
      setIsPopoverOpen(false)
    }
  }, [
    data?.teamMeals?.length,
    debouncedSearchQuery.length,
    debouncedSearchQuery,
  ])

  return (
    <div className="space-y-4">
      {/* Recipe Builder Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Existing Recipes */}
        <Card className="border-dashed hover:border-solid transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Browse Recipe Library</h4>
              <Badge variant="secondary" className="ml-auto text-xs">
                Quick Add
              </Badge>
            </div>

            <Popover
              open={isPopoverOpen}
              onOpenChange={(open) => {
                // Only allow closing, don't auto-open
                if (!open) setIsPopoverOpen(false)
              }}
            >
              <PopoverTrigger asChild>
                <div>
                  <Input
                    id="search-meals"
                    placeholder="Search recipes by name, ingredient, or cuisine..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    iconStart={<Search />}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-2"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <MealSearchResults
                  meals={data?.teamMeals || []}
                  dayId={dayId}
                  nutritionPlanId={nutritionPlanId}
                  isLoading={isLoading}
                  searchQuery={debouncedSearchQuery}
                  onMealAdded={handleMealAdded}
                />
              </PopoverContent>
            </Popover>

            <p className="text-xs text-muted-foreground mt-2">
              Search your recipe collection and add to today's menu
            </p>
          </CardContent>
        </Card>

        {/* Create New Recipe */}
        <Card className="border-dashed hover:border-solid transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Create New Recipe</h4>
              <Badge variant="outline" className="ml-auto text-xs">
                Custom
              </Badge>
            </div>

            <Button
              onClick={handleCreateCustomMeal}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Build Custom Recipe
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Create a new recipe with instructions and ingredients
            </p>
          </CardContent>
        </Card>
      </div>

      <CreateCustomMealDrawer
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        dayId={dayId}
        nutritionPlanId={nutritionPlanId}
        onMealCreated={handleCustomMealCreated}
      />
    </div>
  )
}
