'use client'

import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Plus,
} from 'lucide-react'
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs'
import { useMemo, useState } from 'react'

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
import { cn } from '@/lib/utils'

import { MealCard } from './components/meal-card'
import { MealFormDrawer } from './components/meal-form-drawer'
import { MealSearchInput } from './components/meal-search-input'
import { MealsTable } from './components/meals-table'

type UsageFilter = 'all' | 'used' | 'unused'
type ArchivedFilter = 'active' | 'archived' | 'all'
type ViewMode = 'cards' | 'table'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export function MealLibraryContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // URL state management with nuqs
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      sort: parseAsStringEnum<GQLMealSortBy>(
        Object.values(GQLMealSortBy),
      ).withDefault(GQLMealSortBy.Name),
      usage: parseAsStringEnum<UsageFilter>([
        'all',
        'used',
        'unused',
      ]).withDefault('all'),
      archived: parseAsStringEnum<ArchivedFilter>([
        'active',
        'archived',
        'all',
      ]).withDefault('active'),
      page: parseAsInteger.withDefault(1),
      view: parseAsStringEnum<ViewMode>(['cards', 'table']).withDefault(
        'cards',
      ),
      pageSize: parseAsInteger.withDefault(50),
    },
    {
      history: 'push',
    },
  )

  const { data, isLoading } = useGetMealsForLibraryQuery(
    {
      searchQuery: filters.search || undefined,
      sortBy: filters.sort,
      includeArchived: filters.archived !== 'active' || undefined,
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  )

  // Apply usage and archived filters client-side
  const filteredMeals = useMemo(() => {
    const allMeals = data?.teamMeals || []
    return allMeals.filter((meal) => {
      // Usage filter
      if (filters.usage === 'used' && meal.usageCount === 0) return false
      if (filters.usage === 'unused' && meal.usageCount > 0) return false

      // Archived filter
      if (filters.archived === 'active' && meal.archived) return false
      if (filters.archived === 'archived' && !meal.archived) return false

      return true
    })
  }, [data?.teamMeals, filters.usage, filters.archived])

  // Pagination
  const totalPages = Math.ceil(filteredMeals.length / filters.pageSize)
  const currentPage = Math.min(filters.page, totalPages || 1)
  const startIndex = (currentPage - 1) * filters.pageSize
  const endIndex = startIndex + filters.pageSize
  const paginatedMeals = filteredMeals.slice(startIndex, endIndex)

  const hasMeals = filteredMeals.length > 0

  // Reset to page 1 when filters change
  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number,
  ) => {
    if (key !== 'page' && key !== 'view') {
      setFilters({ [key]: value, page: 1 })
    } else {
      setFilters({ [key]: value })
    }
  }

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

      {/* Search, Filter, Sort, and View Toggle */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <MealSearchInput
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
          />
        </div>
        <Select
          value={filters.archived}
          onValueChange={(value) =>
            handleFilterChange('archived', value as ArchivedFilter)
          }
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
          value={filters.usage}
          onValueChange={(value) =>
            handleFilterChange('usage', value as UsageFilter)
          }
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
          value={filters.sort}
          onValueChange={(value) =>
            handleFilterChange('sort', value as GQLMealSortBy)
          }
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
        <div className="flex gap-1 rounded-md border p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange('view', 'cards')}
            className={cn('gap-2', filters.view === 'cards' && 'bg-muted')}
            iconOnly={<LayoutGrid />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange('view', 'table')}
            className={cn('gap-2', filters.view === 'table' && 'bg-muted')}
            iconOnly={<LayoutList />}
          />
        </div>
      </div>

      {/* Results count and page size selector */}
      {!isLoading && hasMeals && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredMeals.length)}{' '}
            of {filteredMeals.length} meal
            {filteredMeals.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={filters.pageSize.toString()}
              onValueChange={(value) =>
                handleFilterChange('pageSize', parseInt(value))
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && filters.view === 'cards' && (
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isLoading && filters.view === 'table' && (
        <Skeleton className="h-96 w-full rounded-lg" />
      )}

      {/* Empty State */}
      {!isLoading && !hasMeals && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No meals found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {filters.search
              ? `No meals match "${filters.search}". Try a different search.`
              : 'Create your first meal to get started with nutrition planning.'}
          </p>
          {!filters.search && (
            <Button
              iconStart={<Plus />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create Your First Meal
            </Button>
          )}
        </div>
      )}

      {/* Meals Grid View */}
      {!isLoading && hasMeals && filters.view === 'cards' && (
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {paginatedMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {/* Meals Table View */}
      {!isLoading && hasMeals && filters.view === 'table' && (
        <MealsTable meals={paginatedMeals} />
      )}

      {/* Pagination */}
      {!isLoading && hasMeals && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {totalPages > 1 && (
                <>
                  Page {currentPage} of {totalPages}
                </>
              )}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', currentPage - 1)}
                disabled={currentPage === 1}
                iconStart={<ChevronLeft />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('page', currentPage + 1)}
                disabled={currentPage === totalPages}
                iconEnd={<ChevronRight />}
              >
                Next
              </Button>
            </div>
          )}
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
