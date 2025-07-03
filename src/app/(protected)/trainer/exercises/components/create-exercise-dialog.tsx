'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import {
  GQLEquipment,
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
  useCreateExerciseMutation,
  useGetExerciseWithSubstitutesQuery,
  useTrainerExercisesQuery,
  useUpdateExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { MuscleGroupSelector } from './muscle-group-selector'
import { SubstituteExercisesManager } from './substitute-exercises-manager'

interface CreateExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  exercise?: GQLTrainerExercisesQuery['userExercises'][number]
  userExercises?: GQLTrainerExercisesQuery['userExercises']
  publicExercises?: GQLTrainerExercisesQuery['publicExercises']
}

export type CreateExerciseFormData = {
  name: string
  description?: string | null
  equipment?: GQLEquipment
  videoUrl?: string | null
  muscleGroups: {
    id: string
  }[]
  substituteIds: string[]
}

export function CreateExerciseDialog({
  open,
  onOpenChange,
  categories,
  exercise,
  userExercises,
  publicExercises,
}: CreateExerciseDialogProps) {
  const [formData, setFormData] = useState<CreateExerciseFormData>({
    name: exercise?.name ?? '',
    description: exercise?.description ?? '',
    equipment: exercise?.equipment ?? undefined,
    videoUrl: exercise?.videoUrl ?? '',
    muscleGroups: exercise?.muscleGroups.map((mg) => ({ id: mg.id })) ?? [],
    substituteIds: [],
  })

  // Load existing substitute IDs when editing
  const {
    data: exerciseWithSubstitutes,
    isLoading: isLoadingExerciseWithSubstitutes,
  } = useGetExerciseWithSubstitutesQuery(
    {
      id: exercise?.id || '',
    },
    {
      enabled: !!exercise?.id,
    },
  )

  // Update form data when exercise with substitutes is loaded
  useEffect(() => {
    if (exerciseWithSubstitutes?.exercise?.substitutes) {
      const existingSubstituteIds =
        exerciseWithSubstitutes.exercise.substitutes.map(
          (sub) => sub.substituteId,
        )
      setFormData((prev) => ({
        ...prev,
        substituteIds: existingSubstituteIds,
      }))
    }
  }, [exerciseWithSubstitutes])
  const invalidateQuery = useInvalidateQuery()
  const { mutateAsync: createExercise, isPending: isCreatingExercise } =
    useCreateExerciseMutation({
      onSuccess: () => {
        onOpenChange(false)
        toast.success('Exercise created successfully')
        invalidateQuery({
          queryKey: useTrainerExercisesQuery.getKey(),
        })
        invalidateQuery({
          queryKey: useGetExerciseWithSubstitutesQuery.getKey({
            id: exercise?.id || '',
          }),
        })
      },
    })
  const { mutateAsync: updateExercise, isPending: isUpdatingExercise } =
    useUpdateExerciseMutation({
      onSuccess: () => {
        onOpenChange(false)
        toast.success('Exercise updated successfully')
        invalidateQuery({
          queryKey: useTrainerExercisesQuery.getKey(),
        })
        invalidateQuery({
          queryKey: useGetExerciseWithSubstitutesQuery.getKey({
            id: exercise?.id || '',
          }),
        })
      },
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (exercise?.id) {
        await updateExercise({
          id: exercise.id,
          input: {
            ...formData,
            muscleGroups: formData.muscleGroups.map((mg) => mg.id),
            substituteIds: formData.substituteIds,
          },
        })
      } else {
        await createExercise({
          input: {
            ...formData,
            muscleGroups: formData.muscleGroups.map((mg) => mg.id),
            substituteIds: formData.substituteIds,
          },
        })
      }
      // Reset form
      setFormData({
        name: '',
        description: '',
        equipment: undefined,
        videoUrl: '',
        muscleGroups: [],
        substituteIds: [],
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to create exercise. Please try again.')
    }
  }

  const handleMuscleGroupsChange = (muscleGroups: { id: string }[]) => {
    setFormData((prev) => ({ ...prev, muscleGroups }))
  }

  const title = exercise?.id ? 'Edit Exercise' : 'Create New Exercise'
  const description = exercise?.id
    ? 'Edit the exercise details'
    : 'Add a new exercise to your library that you can reuse across training plans.'

  const isNameTakenError:
    | { error: string; level: 'user' | 'public' }
    | undefined = useMemo(() => {
    if (
      userExercises?.some(
        (e) =>
          e.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
          e.id !== exercise?.id,
      )
    ) {
      return {
        error:
          'This exercise already exists in your library. Please choose a different name.',
        level: 'user',
      }
    }

    if (
      publicExercises?.some(
        (e) =>
          e.name.trim().toLowerCase() === formData.name.trim().toLowerCase(),
      )
    ) {
      return {
        error: 'Similar exercise already exists in public library.',
        level: 'public',
      }
    }

    return undefined
  }, [userExercises, publicExercises, formData.name, exercise?.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle={title}
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              variant="secondary"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Barbell Bench Press"
              required
              error={
                isNameTakenError?.level === 'user'
                  ? isNameTakenError.error
                  : undefined
              }
            />
            {isNameTakenError && (
              <p
                className={cn(
                  'text-sm text-orange-400',
                  isNameTakenError.level === 'user' && 'text-red-500',
                )}
              >
                {isNameTakenError.error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment</Label>
            <Select
              value={formData.equipment}
              onValueChange={(value: GQLEquipment) =>
                setFormData((prev) => ({ ...prev, equipment: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="ghost"
              value={formData.description ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the exercise technique and form..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              variant="secondary"
              value={formData.videoUrl ?? ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
              }
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <MuscleGroupSelector
              categories={categories}
              selectedMuscleGroups={formData.muscleGroups}
              onMuscleGroupsChange={handleMuscleGroupsChange}
            />
          </div>

          {formData.muscleGroups.length > 0 && (
            <div className="space-y-2">
              <SubstituteExercisesManager
                exerciseId={exercise?.id || ''}
                selectedMuscleGroupIds={formData.muscleGroups.map(
                  (mg) => mg.id,
                )}
                availableExercises={{
                  userExercises: userExercises || [],
                  publicExercises: publicExercises || [],
                }}
                selectedSubstituteIds={formData.substituteIds}
                onSubstitutesChange={(substituteIds: string[]) => {
                  setFormData((prev) => ({ ...prev, substituteIds }))
                }}
                isLoading={isLoadingExerciseWithSubstitutes}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.name.trim() || isNameTakenError?.level === 'user'
              }
              loading={isCreatingExercise || isUpdatingExercise}
            >
              {exercise?.id ? 'Update Exercise' : 'Create Exercise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
