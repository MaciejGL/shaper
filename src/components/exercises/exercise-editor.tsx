'use client'

import { Check, ChevronLeft, ChevronRight, Settings, X } from 'lucide-react'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useEffect, useState } from 'react'

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
import { useExerciseNames } from '@/hooks/use-exercise-names'
import { useVerifiedExercises } from '@/hooks/use-verified-exercises'

import { Skeleton } from '../ui/skeleton'

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

  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    isDeleting: boolean
  }>({
    isOpen: false,
    exercise: null,
    isDeleting: false,
  })
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
    itemsPerPage,
  ])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
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
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))

      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: exercise.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete exercise')
      }

      setSuccessMessage(`Successfully deleted "${exercise.name}"`)
      setDeleteConfirm({ isOpen: false, exercise: null, isDeleting: false })

      // Remove the deleted exercise from local state instead of refetching all
      setExercises((prev) => prev.filter((ex) => ex.id !== exercise.id))
      // Remove from both allExercises and exercises
      setAllExercises((prev) => prev.filter((ex) => ex.id !== exercise.id))
      setTotalItems((prev) => prev - 1)

      // Trigger stats update only for deletion (significant change)
      onStatsUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise')
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }))
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
        <div className="flex items-center space-x-2">
          {/* Global save/discard removed - now handled per exercise */}
        </div>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        {/* Main filters row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              id="search-exercises"
              variant="secondary"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Clear content filters button */}
          {(filterImages !== 'all' ||
            filterVideo !== 'all' ||
            filterDescription !== 'all' ||
            filterMuscleGroup !== 'all' ||
            filterVerified !== 'all' ||
            filterCreator !== 'all') && (
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
            itemsPerPage !== 25) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setFilterPremium('free')
                setFilterVersion('all')
                setFilterPublic('public')
                setFilterImages('all')
                setFilterVideo('all')
                setFilterDescription('all')
                setFilterMuscleGroup('all')
                setFilterCreator('all')
                setItemsPerPage(25)
                setCurrentPage(1)
              }}
              className="h-9"
            >
              <X className="h-4 w-4 mr-1" />
              Reset All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="space-y-4">
        {loading ? (
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
        ) : exercises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p>No exercises match your current filter criteria.</p>
          </div>
        ) : (
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
                    isDeleting: false,
                  })
                }
              />
            ))}
          </div>
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
          !open &&
          setDeleteConfirm({ isOpen: false, exercise: null, isDeleting: false })
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
                  isDeleting: false,
                })
              }
              disabled={deleteConfirm.isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm.exercise && deleteExercise(deleteConfirm.exercise)
              }
              loading={deleteConfirm.isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ExerciseCard and MediaManagementDialog are now in separate files
// They are imported from './index' above
