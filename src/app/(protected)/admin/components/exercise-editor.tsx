'use client'

import {
  Check,
  Crown,
  Edit,
  Loader2,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { VideoPreview } from '@/components/video-preview'
import { GQLEquipment } from '@/generated/graphql-client'

interface Exercise {
  id: string
  name: string
  description: string | null
  difficulty: string | null
  equipment: string | null
  videoUrl: string | null
  isPublic: boolean
  isPremium: boolean
  version: number
  dataSource: string | null
  additionalInstructions: string | null
  instructions: string | null
  tips: string | null
}

interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  difficulty?: string | null
  equipment?: string | null
  videoUrl?: string | null
  isPublic?: boolean
  isPremium?: boolean
  version?: number
  additionalInstructions?: string | null
  instructions?: string | null
  tips?: string | null
}

interface ExerciseEditorProps {
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

const DIFFICULTY_OPTIONS: string[] = ['beginner', 'intermediate', 'advanced']

export function ExerciseEditor({ onStatsUpdate }: ExerciseEditorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [changes, setChanges] = useState<Map<string, ExerciseUpdate>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [filterPremium, setFilterPremium] = useState<'premium' | 'free'>('free')
  const [filterVersion, setFilterVersion] = useState<'all' | 'v1' | 'v2'>('all')
  const [filterPublic, setFilterPublic] = useState<
    'public' | 'private' | 'all'
  >('public')
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
      })

      const response = await fetch(`/api/admin/exercises/list?${params}`)
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
    currentPage,
    searchTerm,
    filterPremium,
    filterVersion,
    filterPublic,
    itemsPerPage,
  ])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, filterPremium, filterVersion, filterPublic, itemsPerPage])

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
      const response = await fetch('/api/admin/exercises/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      const result = await response.json()
      setChanges(new Map()) // Clear changes after successful save
      setSuccessMessage(`Successfully updated ${result.updated} exercise(s)`)

      // Refresh stats
      onStatsUpdate?.()

      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setChanges(new Map())
    fetchExercises() // Reload original data
  }

  const deleteExercise = async (exercise: Exercise) => {
    try {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))
      setError(null)

      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete exercise')
      }

      // Remove from local state
      setExercises((prev) => prev.filter((ex) => ex.id !== exercise.id))

      // Remove from changes if it was being edited
      setChanges((prev) => {
        const newChanges = new Map(prev)
        newChanges.delete(exercise.id)
        return newChanges
      })

      setSuccessMessage(`Successfully deleted "${exercise.name}"`)
      setDeleteConfirm({ isOpen: false, exercise: null, isDeleting: false })

      // Refresh stats
      onStatsUpdate?.()

      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise')
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }))
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading exercises...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Exercise Editor
              </CardTitle>
              <CardDescription>
                Edit public exercise details and mark as premium. Changes are
                tracked automatically.
              </CardDescription>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-orange-50 border-orange-200"
                >
                  {changes.size} unsaved change(s)
                </Badge>
                <Button
                  onClick={discardChanges}
                  variant="outline"
                  size="sm"
                  disabled={saving}
                >
                  Discard
                </Button>
                <Button
                  onClick={saveChanges}
                  size="sm"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search">Search Exercises</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <div>
                <Label>Premium</Label>
                <Select
                  value={filterPremium}
                  onValueChange={(value: 'premium' | 'free') =>
                    setFilterPremium(value)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Version</Label>
                <Select
                  value={filterVersion}
                  onValueChange={(value: 'all' | 'v1' | 'v2') =>
                    setFilterVersion(value)
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="v1">V1</SelectItem>
                    <SelectItem value="v2">V2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Visibility</Label>
                <Select
                  value={filterPublic}
                  onValueChange={(value: 'public' | 'private' | 'all') =>
                    setFilterPublic(value)
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className={`${changes.has(exercise.id) ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Input
                    id={`name-${exercise.id}`}
                    value={exercise.name}
                    onChange={(e) =>
                      updateExercise(exercise.id, 'name', e.target.value)
                    }
                    placeholder="Exercise name"
                  />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <div className="flex flex-col items-center gap-1">
                    <Select
                      value={exercise.version.toString()}
                      onValueChange={(value) =>
                        updateExercise(exercise.id, 'version', parseInt(value))
                      }
                    >
                      <SelectTrigger variant="ghost">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">V1</SelectItem>
                        <SelectItem value="2">V2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        exercise,
                        isDeleting: false,
                      })
                    }
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  {exercise.isPremium && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id={`description-${exercise.id}`}
                  variant="ghost"
                  value={exercise.description || ''}
                  onChange={(e) =>
                    updateExercise(
                      exercise.id,
                      'description',
                      e.target.value || null,
                    )
                  }
                  placeholder="Exercise description..."
                  className="mt-1 min-h-[60px] resize-none"
                />
              </div>

              {/* Equipment & Difficulty */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Equipment
                  </Label>
                  <Select
                    value={exercise.equipment || 'BODYWEIGHT'}
                    onValueChange={(value) =>
                      updateExercise(exercise.id, 'equipment', value || null)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_OPTIONS.map((eq) => (
                        <SelectItem key={eq} value={eq}>
                          {eq.replace(/_/g, ' ').toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Difficulty
                  </Label>
                  <Select
                    value={exercise.difficulty || 'beginner'}
                    onValueChange={(value) =>
                      updateExercise(exercise.id, 'difficulty', value || null)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Video URL
                  </Label>
                  {exercise.videoUrl && (
                    <VideoPreview url={exercise.videoUrl} variant="secondary" />
                  )}
                </div>
                <Input
                  id={`videoUrl-${exercise.id}`}
                  variant="secondary"
                  value={exercise.videoUrl || ''}
                  onChange={(e) =>
                    updateExercise(
                      exercise.id,
                      'videoUrl',
                      e.target.value || null,
                    )
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exercise.isPublic}
                    onCheckedChange={(checked) =>
                      updateExercise(exercise.id, 'isPublic', checked)
                    }
                  />
                  <Label className="text-sm">Public</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={exercise.isPremium}
                    onCheckedChange={(checked) =>
                      updateExercise(exercise.id, 'isPremium', checked)
                    }
                  />
                  <Label className="text-sm flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Label>
                </div>
              </div>

              {exercise.dataSource && (
                <div className="text-xs text-muted-foreground">
                  Source: {exercise.dataSource}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalItems > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
                {totalItems} exercises
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loading}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2)
                    const pageNum = startPage + i

                    if (pageNum > totalPages) return null

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  }).filter(Boolean)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || loading}
                >
                  Last
                </Button>
              </div>

              {/* Items per page */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Per page:</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value))
                    setCurrentPage(1) // Reset to first page
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {exercises.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            No exercises found matching your criteria
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && deleteConfirm.exercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Exercise
              </CardTitle>
              <CardDescription>
                This action cannot be undone. This will permanently delete the
                exercise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="font-medium text-red-800">
                    {deleteConfirm.exercise.name}
                  </p>
                  <p className="text-sm text-red-600">
                    Version {deleteConfirm.exercise.version} •{' '}
                    {deleteConfirm.exercise.dataSource || 'Manual'}
                    {deleteConfirm.exercise.isPremium && ' • Premium'}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
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
                    onClick={() => deleteExercise(deleteConfirm.exercise!)}
                    disabled={deleteConfirm.isDeleting}
                  >
                    {deleteConfirm.isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Exercise
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
