'use client'

import { Plus, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
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
      <div className="grid grid-cols-[1fr_auto] gap-4">
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
          <PopoverContent align="start" side="bottom">
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

        <Button
          onClick={handleCreateCustomMeal}
          className="w-full justify-start"
          variant="secondary"
          iconStart={<Plus />}
        >
          Create New Recipe
        </Button>
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
