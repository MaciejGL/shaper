'use client'

import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Settings,
  X,
} from 'lucide-react'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { useDebounce } from '@/hooks/use-debounce'
import { useExerciseNames } from '@/hooks/use-exercise-names'
import { useVerifiedExercises } from '@/hooks/use-verified-exercises'

import { Skeleton } from '../ui/skeleton'

import { ExerciseTable } from './exercise-table'
import { type Exercise, ExerciseCard } from './index'
import { getCreatorDisplayName } from './utils/get-creator-display-name'

interface ExerciseEditorProps {
  apiEndpoint: string
  updateEndpoint: string
  deleteEndpoint: string
  title?: string
  onStatsUpdate?: () => void
}

export function ExerciseEditor({
  apiEndpoint,
  updateEndpoint,
  deleteEndpoint,
  title = 'Exercise Management',
  onStatsUpdate,
}: ExerciseEditorProps) {
  // Query state management with nuqs
  const [searchTerm, setSearchTerm] = useQueryState('search', {
    defaultValue: '',
    clearOnDefault: true,
  })

  // Local search input state for immediate UI feedback
  const [searchInput, setSearchInput] = useState(searchTerm)

  // Debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchInput, 300)

  // Update URL search term when debounced value changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm)
  }, [debouncedSearchTerm, setSearchTerm])

  // Sync input with URL when searchTerm changes externally (e.g., clear all filters)
  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])
  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  )
  const [itemsPerPage, setItemsPerPage] = useQueryState(
    'limit',
    parseAsInteger.withDefault(25).withOptions({ clearOnDefault: true }),
  )
  const [filterPremium, setFilterPremium] = useQueryState(
    'premium',
    parseAsStringEnum<'premium' | 'free' | 'all'>(['premium', 'free', 'all'])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterVersion, setFilterVersion] = useQueryState(
    'version',
    parseAsStringEnum<'all' | 'v1' | 'v2'>(['all', 'v1', 'v2'])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterPublic, setFilterPublic] = useQueryState(
    'public',
    parseAsStringEnum<'public' | 'private' | 'all'>([
      'public',
      'private',
      'all',
    ])
      .withDefault('public')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterImages, setFilterImages] = useQueryState(
    'images',
    parseAsStringEnum<'all' | 'with' | 'without'>(['all', 'with', 'without'])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterVideo, setFilterVideo] = useQueryState(
    'video',
    parseAsStringEnum<'all' | 'with' | 'without'>(['all', 'with', 'without'])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterDescription, setFilterDescription] = useQueryState(
    'description',
    parseAsStringEnum<'all' | 'with' | 'without'>(['all', 'with', 'without'])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterMuscleGroup, setFilterMuscleGroup] = useQueryState('muscle', {
    defaultValue: 'all',
    clearOnDefault: true,
  })
  const [filterVerified, setFilterVerified] = useQueryState(
    'verified',
    parseAsStringEnum<'all' | 'verified' | 'unverified'>([
      'all',
      'verified',
      'unverified',
    ])
      .withDefault('all')
      .withOptions({ clearOnDefault: true }),
  )
  const [filterCreator, setFilterCreator] = useQueryState('creator', {
    defaultValue: 'all',
    clearOnDefault: true,
  })
  const [filterEquipment, setFilterEquipment] = useQueryState('equipment', {
    defaultValue: 'all',
    clearOnDefault: true,
  })

  // Component state
  const [allExercises, setAllExercises] = useState<Exercise[]>([]) // Raw data from API
  const [exercises, setExercises] = useState<Exercise[]>([]) // Filtered exercises for display
  const [loading, setLoading] = useState(true)
  const [availableCreators, setAvailableCreators] = useState<
    { id: string; name: string; email: string }[]
  >([])

  // Verified exercises hook (localStorage)
  const { isVerified } = useVerifiedExercises()

  // Exercise names for duplicate detection
  const { hasSimilarPublicExercise } = useExerciseNames({
    includePrivate: true,
  })

  // View mode toggle with persistence
  const [viewMode, setViewMode] = useQueryState(
    'view',
    parseAsStringEnum<'card' | 'table'>(['card', 'table'])
      .withDefault('card')
      .withOptions({ clearOnDefault: true }),
  )

  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Apply verified filter to exercises
  const applyVerifiedFilter = useCallback(
    (exerciseList: Exercise[]) => {
      if (filterVerified === 'verified') {
        return exerciseList.filter((ex) => isVerified(ex.id))
      } else if (filterVerified === 'unverified') {
        return exerciseList.filter((ex) => !isVerified(ex.id))
      }
      return exerciseList
    },
    [filterVerified, isVerified],
  )

  // Re-filter exercises when verified filter or verified state changes
  useEffect(() => {
    if (allExercises.length > 0) {
      const filteredExercises = applyVerifiedFilter(allExercises)
      setExercises(filteredExercises)
    }
  }, [allExercises, applyVerifiedFilter])

  // Remove muscle group data - now handled by individual exercise hooks

  // Remove muscle group helper - now handled by individual exercise hooks
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    exercise: Exercise | null
  }>({
    isOpen: false,
    exercise: null,
  })

  // Handle optimistic updates for table toggles
  const handleExerciseUpdate = useCallback(
    (exerciseId: string, field: 'isPublic' | 'isPremium', value: boolean) => {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, [field]: value }
            : exercise,
        ),
      )
      setAllExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, [field]: value }
            : exercise,
        ),
      )
    },
    [],
  )

  // Handle optimistic updates for name changes
  const handleNameUpdate = useCallback(
    (exerciseId: string, newName: string) => {
      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, name: newName }
            : exercise,
        ),
      )
      setAllExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, name: newName }
            : exercise,
        ),
      )
    },
    [],
  )
  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        premium: filterPremium,
        version: filterVersion,
        public: filterPublic,
        images: filterImages,
        video: filterVideo,
        description: filterDescription,
        muscle: filterMuscleGroup,
        creator: filterCreator,
        equipment: filterEquipment,
      })

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch exercises')
      }

      const data = await response.json()

      // Store all exercises (filtering happens in useEffect)
      setAllExercises(data.exercises)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)

      // Extract unique creators from exercises
      const creatorsMap = new Map<
        string,
        { id: string; name: string; email: string }
      >()
      data.exercises.forEach((exercise: Exercise) => {
        if (exercise.createdBy && !creatorsMap.has(exercise.createdBy.id)) {
          creatorsMap.set(exercise.createdBy.id, {
            id: exercise.createdBy.id,
            name: getCreatorDisplayName(exercise.createdBy),
            email: exercise.createdBy.email,
          })
        }
      })
      setAvailableCreators(Array.from(creatorsMap.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exercises')
    } finally {
      setLoading(false)
    }
  }, [
    apiEndpoint,
    currentPage,
    searchTerm,
    filterPremium,
    filterVersion,
    filterPublic,
    filterImages,
    filterVideo,
    filterDescription,
    filterMuscleGroup,
    filterCreator,
    filterEquipment,
    itemsPerPage,
  ])

  // Silent background refresh without loading states
  const silentRefreshExercises = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        premium: filterPremium,
        version: filterVersion,
        public: filterPublic,
        images: filterImages,
        video: filterVideo,
        description: filterDescription,
        muscle: filterMuscleGroup,
        creator: filterCreator,
        equipment: filterEquipment,
      })

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch exercises')
      }

      const data = await response.json()

      // Store all exercises (filtering happens in useEffect)
      setAllExercises(data.exercises)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)

      console.info(
        '🔄 Silent refresh completed - exercises updated in background',
      )
    } catch (err) {
      console.warn('Silent refresh failed:', err)
      // Don't show error to user for background refresh failures
    }
  }, [
    apiEndpoint,
    currentPage,
    searchTerm,
    filterPremium,
    filterVersion,
    filterPublic,
    filterImages,
    filterVideo,
    filterDescription,
    filterMuscleGroup,
    filterCreator,
    filterEquipment,
    itemsPerPage,
  ])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change (but not view mode)
  }, [
    searchTerm,
    filterPremium,
    filterVersion,
    filterPublic,
    filterImages,
    filterVideo,
    filterDescription,
    filterMuscleGroup,
    filterVerified,
    filterCreator,
    filterEquipment,
    itemsPerPage,
    setCurrentPage,
  ])

  // Muscle categories are now fetched via GraphQL hook above

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  // Remove updateExercise - now handled by individual exercise hooks

  // Remove async update function - now handled by individual exercise hooks

  const deleteExercise = async (exercise: Exercise) => {
    try {
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: exercise.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete exercise')
      }

      // Close dialog and show success toast
      setDeleteConfirm({ isOpen: false, exercise: null })
      toast.success(`Successfully deleted "${exercise.name}"`)

      // Check if we need to go back a page (if this was the last item on current page)
      const itemsOnCurrentPage = exercises.length
      const shouldGoToPreviousPage = itemsOnCurrentPage === 1 && currentPage > 1

      if (shouldGoToPreviousPage) {
        setCurrentPage(currentPage - 1)
      }

      // Use silent refresh to maintain consistency and current view/pagination
      await silentRefreshExercises()

      // Trigger stats update only for deletion (significant change)
      onStatsUpdate?.()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete exercise',
      )
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <h3 className="font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button
            onClick={fetchExercises}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">Total: {totalItems} exercises</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Main filters row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              id="search-exercises"
              variant="secondary"
              placeholder="Search exercises..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9"
            />
          </div>

          <Select
            value={filterPremium}
            onValueChange={(value: 'premium' | 'free' | 'all') =>
              setFilterPremium(value)
            }
          >
            <SelectTrigger className="w-[120px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterVersion}
            onValueChange={(value: 'all' | 'v1' | 'v2') =>
              setFilterVersion(value)
            }
          >
            <SelectTrigger className="w-[100px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="v1">V1</SelectItem>
              <SelectItem value="v2">V2</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPublic}
            onValueChange={(value: 'public' | 'private' | 'all') =>
              setFilterPublic(value)
            }
          >
            <SelectTrigger className="w-[120px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(parseInt(value))}
          >
            <SelectTrigger className="w-[80px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content filters row */}
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filterImages}
            onValueChange={(value: 'all' | 'with' | 'without') =>
              setFilterImages(value)
            }
          >
            <SelectTrigger className="w-[140px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Images</SelectItem>
              <SelectItem value="with">With Images</SelectItem>
              <SelectItem value="without">Without Images</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterVideo}
            onValueChange={(value: 'all' | 'with' | 'without') =>
              setFilterVideo(value)
            }
          >
            <SelectTrigger className="w-[140px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="with">With Video</SelectItem>
              <SelectItem value="without">Without Video</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterDescription}
            onValueChange={(value: 'all' | 'with' | 'without') =>
              setFilterDescription(value)
            }
          >
            <SelectTrigger className="w-[160px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Descriptions</SelectItem>
              <SelectItem value="with">With Description</SelectItem>
              <SelectItem value="without">Without Description</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterMuscleGroup}
            onValueChange={setFilterMuscleGroup}
          >
            <SelectTrigger className="w-[140px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscles</SelectItem>
              {/* Muscle group filter options - can be re-added if needed */}
            </SelectContent>
          </Select>

          <Select
            value={filterVerified}
            onValueChange={(value: 'all' | 'verified' | 'unverified') =>
              setFilterVerified(value)
            }
          >
            <SelectTrigger className="w-[120px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">✅ Verified</SelectItem>
              <SelectItem value="unverified">⏳ Unverified</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCreator} onValueChange={setFilterCreator}>
            <SelectTrigger className="w-[140px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              {availableCreators.map((creator) => (
                <SelectItem key={creator.id} value={creator.id}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEquipment} onValueChange={setFilterEquipment}>
            <SelectTrigger className="w-[140px] h-9" variant="tertiary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Equipment</SelectItem>
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <SelectItem key={equipment.value} value={equipment.value}>
                  {equipment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear content filters button */}
          {(filterImages !== 'all' ||
            filterVideo !== 'all' ||
            filterDescription !== 'all' ||
            filterMuscleGroup !== 'all' ||
            filterVerified !== 'all' ||
            filterCreator !== 'all' ||
            filterEquipment !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterImages('all')
                setFilterVideo('all')
                setFilterDescription('all')
                setFilterMuscleGroup('all')
                setFilterVerified('all')
                setFilterCreator('all')
                setFilterEquipment('all')
              }}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Content Filters
            </Button>
          )}

          {/* Clear all filters button */}
          {(searchTerm !== '' ||
            filterPremium !== 'free' ||
            filterVersion !== 'all' ||
            filterPublic !== 'public' ||
            filterImages !== 'all' ||
            filterVideo !== 'all' ||
            filterDescription !== 'all' ||
            filterMuscleGroup !== 'all' ||
            filterCreator !== 'all' ||
            filterEquipment !== 'all' ||
            itemsPerPage !== 25) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('')
                setSearchTerm('')
                setFilterPremium('all')
                setFilterVersion('all')
                setFilterPublic('all')
                setFilterImages('all')
                setFilterVideo('all')
                setFilterDescription('all')
                setFilterMuscleGroup('all')
                setFilterCreator('all')
                setFilterEquipment('all')
                setItemsPerPage(100)
                setCurrentPage(1)
              }}
              className="h-9"
              iconStart={<X />}
            >
              Reset All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Exercise Content */}
      <div className="space-y-4">
        {loading ? (
          viewMode === 'card' ? (
            <div className="grid gap-4 grid-cols-1">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-2/3" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="p-4">
                <Skeleton className="h-8 w-full mb-4" />
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
              </div>
            </div>
          )
        ) : exercises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p>No exercises match your current filter criteria.</p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                updateEndpoint={updateEndpoint}
                allExercises={exercises}
                hasSimilarPublicExercise={hasSimilarPublicExercise}
                onSilentRefresh={silentRefreshExercises}
                onDelete={(ex) =>
                  setDeleteConfirm({
                    isOpen: true,
                    exercise: ex,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <ExerciseTable
            exercises={exercises}
            updateEndpoint={updateEndpoint}
            hasSimilarPublicExercise={hasSimilarPublicExercise}
            onExerciseUpdate={handleExerciseUpdate}
            onNameUpdate={handleNameUpdate}
            onDelete={(ex) =>
              setDeleteConfirm({
                isOpen: true,
                exercise: ex,
              })
            }
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{' '}
            results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ isOpen: false, exercise: null })
        }
      >
        <DialogContent dialogTitle="Delete Exercise">
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm.exercise?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirm({
                  isOpen: false,
                  exercise: null,
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm.exercise && deleteExercise(deleteConfirm.exercise)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
