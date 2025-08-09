'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Image as ImageIcon,
  MoreHorizontal,
  Play,
  Trash2,
  X,
} from 'lucide-react'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { GQLEquipment } from '@/generated/graphql-client'
import { downloadJsonFile } from '@/lib/download-utils'
import { translateEquipment } from '@/utils/translate-equipment'

interface Exercise {
  id: string
  name: string
  description?: string | null
  equipment: string
  isPublic: boolean
  isPremium: boolean
  version: number
  createdAt: string
  updatedAt: string
  videoUrl?: string | null
  images?: {
    id: string
    url: string
    order: number
  }[]
  muscleGroups?: {
    id: string
    name: string
    alias?: string | null
    groupSlug: string
  }[]
}

interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  equipment?: string
  isPublic?: boolean
  isPremium?: boolean
  version?: number
  videoUrl?: string | null
  images?: {
    id: string
    url: string
    order: number
  }[]
}

interface ExerciseEditorProps {
  apiEndpoint: string
  updateEndpoint: string
  deleteEndpoint: string
  title?: string
  onStatsUpdate?: () => void
}

const EQUIPMENT_OPTIONS: GQLEquipment[] = [
  GQLEquipment.Barbell,
  GQLEquipment.EzBar,
  GQLEquipment.Dumbbell,
  GQLEquipment.Machine,
  GQLEquipment.Cable,
  GQLEquipment.Bodyweight,
  GQLEquipment.Band,
  GQLEquipment.Kettlebell,
  GQLEquipment.SmithMachine,
  GQLEquipment.MedicineBall,
  GQLEquipment.ExerciseBall,
  GQLEquipment.PullUpBar,
  GQLEquipment.Bench,
  GQLEquipment.InclineBench,
  GQLEquipment.Mat,
  GQLEquipment.FoamRoller,
  GQLEquipment.Other,
]

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
    parseAsStringEnum<'premium' | 'free'>(['premium', 'free'])
      .withDefault('free')
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

  // Component state
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [changes, setChanges] = useState<Map<string, ExerciseUpdate>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [muscleCategories, setMuscleCategories] = useState<
    {
      id: string
      name: string
      slug: string
    }[]
  >([])
  const [loadingMuscleCategories, setLoadingMuscleCategories] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    exercise: Exercise | null
    isDeleting: boolean
  }>({
    isOpen: false,
    exercise: null,
    isDeleting: false,
  })
  const [isExporting, setIsExporting] = useState(false)
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
      })

      const response = await fetch(`${apiEndpoint}?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch exercises')
      }

      const data = await response.json()
      setExercises(data.exercises)
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
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
    itemsPerPage,
    setCurrentPage,
  ])

  // Fetch muscle categories for filter dropdown
  useEffect(() => {
    const fetchMuscleCategories = async () => {
      try {
        setLoadingMuscleCategories(true)
        const response = await fetch('/api/muscle-groups')
        if (response.ok) {
          const data = await response.json()
          setMuscleCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch muscle categories:', error)
      } finally {
        setLoadingMuscleCategories(false)
      }
    }

    fetchMuscleCategories()
  }, [])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  const updateExercise = (
    id: string,
    field: keyof ExerciseUpdate,
    value: string | boolean | number | null,
  ) => {
    setChanges((prev) => {
      const newChanges = new Map(prev)
      const existing = newChanges.get(id) || { id }
      newChanges.set(id, { ...existing, [field]: value })
      return newChanges
    })

    // Update local state for immediate UI feedback
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    )
  }

  const hasChanges = changes.size > 0

  const saveChanges = async () => {
    if (!hasChanges) return

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const updates = Array.from(changes.values())
      const response = await fetch(updateEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      const result = await response.json()
      setSuccessMessage(`Successfully updated ${result.updated} exercises`)
      setChanges(new Map())
      onStatsUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setChanges(new Map())
    fetchExercises() // Refetch to reset any local changes
  }

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
      fetchExercises()
      onStatsUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise')
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  const exportExercises = async () => {
    if (isExporting) return // Prevent multiple exports

    try {
      setIsExporting(true)
      const response = await fetch(`${apiEndpoint}?page=1&limit=10000`)
      if (!response.ok) {
        throw new Error('Failed to fetch exercises for export')
      }

      const data = await response.json()
      const filename = `exercises-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJsonFile(data.exercises, filename)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to export exercises',
      )
    } finally {
      setIsExporting(false)
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
          <Button
            onClick={exportExercises}
            variant="outline"
            size="sm"
            disabled={isExporting}
            loading={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          {hasChanges && (
            <>
              <Button onClick={discardChanges} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={saveChanges} size="sm" loading={saving}>
                <Check className="h-4 w-4 mr-2" />
                Save {changes.size} Change{changes.size !== 1 ? 's' : ''}
              </Button>
            </>
          )}
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
        <div className="flex flex-wrap items-center gap-4 border rounded-lg p-4 bg-muted/30">
          <div className="flex-1 min-w-[200px]">
            <Input
              id="search-exercises"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>

          <Select
            value={filterPremium}
            onValueChange={(value: 'premium' | 'free') =>
              setFilterPremium(value)
            }
          >
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="w-[100px] h-9">
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
            <SelectTrigger className="w-[120px] h-9">
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
            <SelectTrigger className="w-[80px] h-9">
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
        <div className="flex flex-wrap items-center gap-4 border rounded-lg p-4 bg-muted/20">
          <span className="text-sm font-medium text-muted-foreground">
            Content Filters:
          </span>

          <Select
            value={filterImages}
            onValueChange={(value: 'all' | 'with' | 'without') =>
              setFilterImages(value)
            }
          >
            <SelectTrigger className="w-[140px] h-9">
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
            <SelectTrigger className="w-[140px] h-9">
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
            <SelectTrigger className="w-[160px] h-9">
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
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscles</SelectItem>
              {!loadingMuscleCategories &&
                muscleCategories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Clear content filters button */}
          {(filterImages !== 'all' ||
            filterVideo !== 'all' ||
            filterDescription !== 'all' ||
            filterMuscleGroup !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterImages('all')
                setFilterVideo('all')
                setFilterDescription('all')
                setFilterMuscleGroup('all')
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

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Exercise Name</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="w-[140px]">Equipment</TableHead>
              <TableHead className="w-[100px]">Version</TableHead>
              <TableHead className="w-[150px]">Media</TableHead>
              <TableHead className="w-[180px]">Muscles</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : exercises.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No exercises found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              exercises.map((exercise) => (
                <ExerciseTableRow
                  key={exercise.id}
                  exercise={exercise}
                  changes={changes.get(exercise.id)}
                  onUpdate={updateExercise}
                  onDelete={(ex) =>
                    setDeleteConfirm({
                      isOpen: true,
                      exercise: ex,
                      isDeleting: false,
                    })
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
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

interface ExerciseTableRowProps {
  exercise: Exercise
  changes?: ExerciseUpdate
  onUpdate: (
    id: string,
    field: keyof ExerciseUpdate,
    value: string | boolean | number | null,
  ) => void
  onDelete: (exercise: Exercise) => void
}

function ExerciseTableRow({
  exercise,
  changes,
  onUpdate,
  onDelete,
}: ExerciseTableRowProps) {
  const currentExercise = { ...exercise, ...changes }
  const hasChanges = Boolean(changes && Object.keys(changes).length > 1) // > 1 because id is always present
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)

  return (
    <TableRow className={hasChanges ? 'bg-blue-50/50 border-blue-200' : ''}>
      <TableCell>
        <Input
          id={`exercise-name-${exercise.id}`}
          value={currentExercise.name}
          onChange={(e) => onUpdate(exercise.id, 'name', e.target.value)}
          className="h-8 border-0 shadow-none p-1 focus-visible:ring-1"
          placeholder="Exercise name"
        />
        {hasChanges && (
          <div className="flex items-center space-x-1 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-xs text-blue-600">Modified</span>
          </div>
        )}
      </TableCell>

      <TableCell>
        {isDescriptionExpanded ? (
          <Textarea
            id={`exercise-description-${exercise.id}`}
            value={currentExercise.description || ''}
            onChange={(e) =>
              onUpdate(exercise.id, 'description', e.target.value || null)
            }
            className="min-h-[60px] text-sm"
            onBlur={() => setIsDescriptionExpanded(false)}
            autoFocus
          />
        ) : (
          <div
            className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[32px] max-w-[280px]"
            onClick={() => setIsDescriptionExpanded(true)}
          >
            {currentExercise.description ? (
              <span className="line-clamp-2">
                {currentExercise.description}
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                Click to add description
              </span>
            )}
          </div>
        )}
      </TableCell>

      <TableCell>
        <Select
          value={currentExercise.equipment}
          onValueChange={(value) => onUpdate(exercise.id, 'equipment', value)}
        >
          <SelectTrigger className="h-8 border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <SelectItem key={equipment} value={equipment}>
                {translateEquipment(equipment)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <Select
          value={currentExercise.version.toString()}
          onValueChange={(value) =>
            onUpdate(exercise.id, 'version', parseInt(value))
          }
        >
          <SelectTrigger className="h-8 w-20 border-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">V1</SelectItem>
            <SelectItem value="2">V2</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <MediaCell
          exercise={currentExercise}
          onManageMedia={() => setIsMediaDialogOpen(true)}
        />
        <MediaManagementDialog
          exercise={currentExercise}
          isOpen={isMediaDialogOpen}
          onClose={() => setIsMediaDialogOpen(false)}
          onUpdateExercise={(updates) => {
            if (updates.videoUrl !== undefined) {
              onUpdate(exercise.id, 'videoUrl', updates.videoUrl)
            }
          }}
        />
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap gap-1">
          {exercise.muscleGroups && exercise.muscleGroups.length > 0 ? (
            // Get unique muscle categories from the exercise's muscle groups
            Array.from(
              new Set(exercise.muscleGroups.map((muscle) => muscle.groupSlug)),
            )
              .slice(0, 3)
              .map((groupSlug) => {
                const categoryName =
                  groupSlug.charAt(0).toUpperCase() + groupSlug.slice(1)

                return (
                  <span
                    key={groupSlug}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    {categoryName}
                  </span>
                )
              })
          ) : (
            <span className="text-xs text-muted-foreground">No muscles</span>
          )}
          {exercise.muscleGroups &&
            Array.from(new Set(exercise.muscleGroups.map((m) => m.groupSlug)))
              .length > 3 && (
              <span className="text-xs text-muted-foreground">
                +
                {Array.from(
                  new Set(exercise.muscleGroups.map((m) => m.groupSlug)),
                ).length - 3}{' '}
                more
              </span>
            )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentExercise.isPublic}
              onCheckedChange={(checked) =>
                onUpdate(exercise.id, 'isPublic', checked)
              }
              className="scale-75"
            />
            <span className="text-xs">Public</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentExercise.isPremium}
              onCheckedChange={(checked) =>
                onUpdate(exercise.id, 'isPremium', checked)
              }
              className="scale-75"
            />
            <span className="text-xs">Premium</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(exercise)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

interface MediaCellProps {
  exercise: Exercise
  onManageMedia: () => void
}

function MediaCell({ exercise, onManageMedia }: MediaCellProps) {
  const videoCount = exercise.videoUrl ? 1 : 0
  const imageCount = exercise.images?.length || 0
  const hasMedia = videoCount > 0 || imageCount > 0

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs justify-start"
      onClick={onManageMedia}
    >
      {hasMedia ? (
        <div className="flex items-center space-x-1">
          {videoCount > 0 && (
            <div className="flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>{videoCount}</span>
            </div>
          )}
          {imageCount > 0 && (
            <div className="flex items-center space-x-1">
              <ImageIcon className="h-3 w-3" />
              <span>{imageCount}</span>
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">Add media</span>
      )}
    </Button>
  )
}

interface MediaManagementDialogProps {
  exercise: Exercise
  isOpen: boolean
  onClose: () => void
  onUpdateExercise: (updates: Partial<ExerciseUpdate>) => void
}

function MediaManagementDialog({
  exercise,
  isOpen,
  onClose,
  onUpdateExercise,
}: MediaManagementDialogProps) {
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleSave = () => {
    onUpdateExercise({
      videoUrl: videoUrl || null,
    })
    onClose()
  }

  const handleVideoPreview = () => {
    if (videoUrl) {
      setPreviewUrl(videoUrl)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dialogTitle="Manage Media" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Media - {exercise.name}</DialogTitle>
          <DialogDescription>
            Manage videos and images for this exercise
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Video</h3>
            <div className="flex items-center space-x-2">
              <Input
                id={`video-url-${exercise.id}`}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="flex-1"
              />
              {videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVideoPreview}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
            </div>

            {previewUrl && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <iframe
                  src={
                    previewUrl.includes('youtube.com')
                      ? previewUrl.replace('watch?v=', 'embed/')
                      : previewUrl
                  }
                  className="w-full h-64"
                  frameBorder="0"
                  allowFullScreen
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setPreviewUrl(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Images</h3>
            {exercise.images && exercise.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exercise.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`Exercise ${exercise.name} - Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No images uploaded</p>
                <p className="text-xs">
                  Images are managed through the exercise creation dialog
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
