'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  GQLGetNutritionPlanQuery,
  type GQLTeamMealsQuery,
  useAddMealToNutritionPlanDayMutation,
  useGetNutritionPlanQuery,
  useTeamMealsQuery,
} from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type LightMeal = NonNullable<GQLTeamMealsQuery['teamMeals']>[number]

interface MealSearchComboboxProps {
  dayId: string
  nutritionPlanId: string
  onMealAdded?: () => void
  placeholder?: string
  className?: string
}

export function MealSearchCombobox({
  dayId,
  nutritionPlanId,
  onMealAdded,
  placeholder = 'Search recipes by name, ingredient, or cuisine...',
  className,
}: MealSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()

  // Debounce search query by 500ms for better UX
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Only search when we have a meaningful query (2+ characters)
  const { data, isLoading } = useTeamMealsQuery(
    { searchQuery: debouncedSearchQuery || undefined },
    {
      enabled: debouncedSearchQuery.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const addMealMutation = useAddMealToNutritionPlanDayMutation({
    onMutate: async (variables) => {
      // Optimistic update
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      // Find the meal being added for optimistic UI
      const meal = data?.teamMeals?.find((m) => m.id === variables.input.mealId)
      if (meal) {
        // Add optimistic meal to the day
        queryClient.setQueryData(
          queryKey,
          (old: GQLGetNutritionPlanQuery | undefined) => {
            if (!old?.nutritionPlan) return old

            const updatedDays = old.nutritionPlan.days.map((day) => {
              if (day.id === dayId) {
                return {
                  ...day,
                  meals: [
                    ...day.meals,
                    {
                      id: `temp-${Date.now()}`,
                      meal,
                      portionMultiplier: variables.input.portionMultiplier,
                    },
                  ],
                }
              }
              return day
            })

            return {
              ...old,
              nutritionPlan: {
                ...old.nutritionPlan,
                days: updatedDays,
              },
            }
          },
        )
      }

      return { previousData }
    },
    onSuccess: () => {
      toast.success('Meal added to day!')
      setSearchQuery('')
      setIsOpen(false)
      onMealAdded?.()
    },
    onError: (error, variables, context) => {
      toast.error('Failed to add meal: ' + (error as Error).message)
      // Rollback optimistic update
      if (context?.previousData) {
        const queryKey = useGetNutritionPlanQuery.getKey({
          id: nutritionPlanId,
        })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
      const queryKey = useGetNutritionPlanQuery.getKey({ id: nutritionPlanId })
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const handleAddMeal = (meal: LightMeal) => {
    addMealMutation.mutate({
      input: {
        dayId,
        mealId: meal.id,
        portionMultiplier: 1.0,
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
      e.currentTarget.blur()
    }
    // Enter key will be handled by Command component for selections
  }

  const meals = data?.teamMeals || []
  const hasResults = meals.length > 0
  const showResults = isOpen && searchQuery.length >= 2

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
            if (e.target.value.length >= 2) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.length >= 2) setIsOpen(true)
          }}
          onBlur={(e) => {
            // Don't close if clicking on the dropdown itself
            const relatedTarget = e.relatedTarget as HTMLElement
            if (relatedTarget?.closest('#meal-search-results')) {
              return
            }
            // Stable delay to prevent flickering
            setTimeout(() => setIsOpen(false), 150)
          }}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          role="combobox"
          aria-controls="meal-search-results"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          id="meal-search-results"
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
          style={{
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <Command className="rounded-md">
            <CommandList className="max-h-64">
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {!isLoading && !hasResults && (
                <CommandEmpty className="py-6 text-center text-sm">
                  No meals found for "{debouncedSearchQuery}"
                </CommandEmpty>
              )}

              {!isLoading && hasResults && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {meals.length} meal{meals.length !== 1 ? 's' : ''} found
                  </div>
                  {meals.map((meal) => (
                    <CommandItem
                      key={meal.id}
                      className="cursor-pointer data-[selected=true]:bg-accent/50"
                      onSelect={() => handleAddMeal(meal)}
                      disabled={addMealMutation.isPending}
                    >
                      <div className="flex w-full items-center justify-between py-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">
                            {meal.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {meal.totalMacros.calories.toFixed(0)} kcal | P:{' '}
                            {meal.totalMacros.protein.toFixed(0)}g | C:{' '}
                            {meal.totalMacros.carbs.toFixed(0)}g | F:{' '}
                            {meal.totalMacros.fat.toFixed(0)}g
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={addMealMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddMeal(meal)
                          }}
                          onTouchStart={(e) => {
                            // Prevent scrolling on mobile when touching button
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
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
