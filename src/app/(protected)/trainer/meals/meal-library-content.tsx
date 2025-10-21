'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GQLMealSortBy,
  useGetMealsForLibraryQuery,
} from '@/generated/graphql-client'

import { MealCard } from './components/meal-card'
import { MealFormDrawer } from './components/meal-form-drawer'
import { MealSearchInput } from './components/meal-search-input'

type UsageFilter = 'all' | 'used' | 'unused'
type ArchivedFilter = 'active' | 'archived' | 'all'

export function MealLibraryContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<GQLMealSortBy>(GQLMealSortBy.Name)
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all')
  const [archivedFilter, setArchivedFilter] = useState<ArchivedFilter>('active')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data, isLoading } = useGetMealsForLibraryQuery(
    {
      searchQuery: searchQuery || undefined,
      sortBy,
      includeArchived: archivedFilter !== 'active' || undefined,
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  )

  // Apply usage and archived filters client-side
  const allMeals = data?.teamMeals || []
  const meals = allMeals.filter((meal) => {
    // Usage filter
    if (usageFilter === 'used' && meal.usageCount === 0) return false
    if (usageFilter === 'unused' && meal.usageCount > 0) return false

    // Archived filter
    if (archivedFilter === 'active' && meal.archived) return false
    if (archivedFilter === 'archived' && !meal.archived) return false

    return true
  })
  const hasMeals = meals.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meal Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your meal templates and recipes
          </p>
        </div>
        <Button
          iconStart={<Plus />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Meal
        </Button>
      </div>

      {/* Search, Filter, and Sort */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <MealSearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <Select
          value={archivedFilter}
          onValueChange={(value) => setArchivedFilter(value as ArchivedFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Meals</SelectItem>
            <SelectItem value="archived">Archived Meals</SelectItem>
            <SelectItem value="all">All Meals</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={usageFilter}
          onValueChange={(value) => setUsageFilter(value as UsageFilter)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by usage..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meals</SelectItem>
            <SelectItem value="used">Used in Plans</SelectItem>
            <SelectItem value="unused">Not Used</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as GQLMealSortBy)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={GQLMealSortBy.Name}>Name</SelectItem>
            <SelectItem value={GQLMealSortBy.UsageCount}>Most Used</SelectItem>
            <SelectItem value={GQLMealSortBy.CreatedAt}>
              Recently Added
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasMeals && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No meals found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {searchQuery
              ? `No meals match "${searchQuery}". Try a different search.`
              : 'Create your first meal to get started with nutrition planning.'}
          </p>
          {!searchQuery && (
            <Button
              iconStart={<Plus />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Your First Meal
            </Button>
          )}
        </div>
      )}

      {/* Meals Grid */}
      {!isLoading && hasMeals && (
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {/* Create Meal Drawer */}
      <MealFormDrawer
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
