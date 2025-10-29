'use client'

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ImageIcon,
  Play,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Exercise } from './types'
import { getCreatorDisplayName } from './utils/get-creator-display-name'

interface ExerciseTableProps {
  exercises: Exercise[]
  updateEndpoint: string
  hasSimilarPublicExercise: (exercise: Exercise) => boolean
  onDelete: (exercise: Exercise) => void
  onExerciseUpdate?: (
    exerciseId: string,
    field: 'isPublic' | 'isPremium' | 'verified',
    value: boolean,
  ) => void
  onNameUpdate?: (exerciseId: string, newName: string) => void
}

export function ExerciseTable({
  exercises,
  updateEndpoint,
  hasSimilarPublicExercise,
  onDelete,
  onExerciseUpdate,
  onNameUpdate,
}: ExerciseTableProps) {
  // Track loading state for individual toggles
  const [loadingToggles, setLoadingToggles] = useState<Set<string>>(new Set())

  // State for inline name editing
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  )
  const [editingName, setEditingName] = useState('')
  const [savingName, setSavingName] = useState(false)

  // State for sorting
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Sort exercises by name
  const sortedExercises = useMemo(() => {
    if (!sortOrder) return exercises

    return [...exercises].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      })
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [exercises, sortOrder])

  // Toggle sort order
  const handleSortByName = () => {
    setSortOrder((current) => {
      if (current === null) return 'asc'
      if (current === 'asc') return 'desc'
      return null
    })
  }

  // Handle toggle changes with immediate save
  const handleToggleChange = async (
    exerciseId: string,
    field: 'isPublic' | 'isPremium',
    newValue: boolean,
  ) => {
    const toggleKey = `${exerciseId}-${field}`

    try {
      setLoadingToggles((prev) => new Set(prev).add(toggleKey))

      // Optimistic update - update local state immediately
      if (onExerciseUpdate) {
        onExerciseUpdate(exerciseId, field, newValue)
      }

      const response = await fetch(updateEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            {
              id: exerciseId,
              [field]: newValue,
            },
          ],
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        if (onExerciseUpdate) {
          onExerciseUpdate(exerciseId, field, !newValue)
        }
        throw new Error('Failed to update exercise')
      }

      toast.success(
        `Exercise ${field === 'isPublic' ? 'visibility' : 'premium status'} updated`,
      )

      // No silent refresh needed - optimistic update already applied
      // Refreshing would reorder items and break pagination context
    } catch (error) {
      console.error('Failed to update exercise:', error)
      toast.error(
        `Failed to update exercise ${field === 'isPublic' ? 'visibility' : 'premium status'}`,
      )

      // Note: Optimistic update revert is handled above in the !response.ok case
    } finally {
      setLoadingToggles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(toggleKey)
        return newSet
      })
    }
  }

  const handleNameEdit = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id)
    setEditingName(exercise.name)
  }

  const handleNameCancel = () => {
    setEditingExerciseId(null)
    setEditingName('')
  }

  const handleNameSave = async (exerciseId: string) => {
    if (!editingName.trim()) {
      toast.error('Exercise name cannot be empty')
      return
    }

    try {
      setSavingName(true)

      // Optimistic update
      if (onNameUpdate) {
        onNameUpdate(exerciseId, editingName.trim())
      }

      const response = await fetch(updateEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            {
              id: exerciseId,
              name: editingName.trim(),
            },
          ],
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        const originalExercise = exercises.find((ex) => ex.id === exerciseId)
        if (onNameUpdate && originalExercise) {
          onNameUpdate(exerciseId, originalExercise.name)
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update exercise name')
      }

      const result = await response.json()
      console.info('Exercise name updated successfully:', result)

      toast.success('Exercise name updated')
      setEditingExerciseId(null)
      setEditingName('')
    } catch (error) {
      console.error('Failed to update exercise name:', error)
      toast.error('Failed to update exercise name')
    } finally {
      setSavingName(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <button
                  onClick={handleSortByName}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  Name
                  {sortOrder === 'asc' && <ArrowUp className="h-4 w-4" />}
                  {sortOrder === 'desc' && <ArrowDown className="h-4 w-4" />}
                </button>
              </TableHead>
              <TableHead className="w-[80px] text-center">Video</TableHead>
              <TableHead className="w-[80px] text-center">Images</TableHead>
              <TableHead className="w-[100px] text-center">Public</TableHead>
              <TableHead className="w-[100px] text-center">Premium</TableHead>
              <TableHead className="w-[100px] text-center">Verified</TableHead>
              <TableHead className="w-[120px]">Creator</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead
                className="w-[80px] text-center"
                title="Number of training exercises using this base exercise across all plans"
              >
                Used In
              </TableHead>
              <TableHead className="w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExercises.map((exercise) => {
              const hasVideo = !!exercise.videoUrl?.trim()
              const imageCount = exercise.images?.length || 0
              const hasDuplicate = hasSimilarPublicExercise(exercise)
              const isPublicLoading = loadingToggles.has(
                `${exercise.id}-isPublic`,
              )
              const isPremiumLoading = loadingToggles.has(
                `${exercise.id}-isPremium`,
              )
              const isVerifiedLoading = loadingToggles.has(
                `${exercise.id}-verified`,
              )

              return (
                <TableRow key={exercise.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {editingExerciseId === exercise.id ? (
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Input
                            id={`edit-name-${exercise.id}`}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 text-sm w-max"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNameSave(exercise.id)
                              } else if (e.key === 'Escape') {
                                handleNameCancel()
                              }
                            }}
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleNameSave(exercise.id)}
                              disabled={savingName}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={handleNameCancel}
                              disabled={savingName}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleNameEdit(exercise)}
                          title="Click to edit name"
                        >
                          {exercise.name}
                        </span>
                      )}
                      {hasDuplicate && (
                        <Badge
                          variant="warning"
                          className="flex items-center gap-1 text-xs"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Duplicate
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {hasVideo ? (
                      <Play className="h-4 w-4 mx-auto text-green-600" />
                    ) : (
                      <span className="text-muted-foreground text-xs">No</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{imageCount}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={exercise.isPublic}
                        disabled={isPublicLoading}
                        onCheckedChange={(checked) =>
                          handleToggleChange(exercise.id, 'isPublic', checked)
                        }
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={exercise.isPremium}
                        disabled={isPremiumLoading}
                        onCheckedChange={(checked) =>
                          handleToggleChange(exercise.id, 'isPremium', checked)
                        }
                        className="data-[state=checked]:bg-purple-500"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={exercise.verified}
                        disabled={isVerifiedLoading}
                        onCheckedChange={(checked) =>
                          handleToggleChange(exercise.id, 'verified', checked)
                        }
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {exercise.createdBy
                      ? getCreatorDisplayName(exercise.createdBy)
                      : 'Unknown'}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          exercise.version === 2 ? 'primary' : 'secondary'
                        }
                        className="text-xs w-fit"
                      >
                        V{exercise.version}
                      </Badge>
                      {exercise.equipment && (
                        <span className="text-xs text-muted-foreground">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      title={`Used in ${exercise.relatedCount || 0} training exercise${(exercise.relatedCount || 0) === 1 ? '' : 's'} across all plans`}
                    >
                      {exercise.relatedCount || 0}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(exercise)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {sortedExercises.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No exercises found matching your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
