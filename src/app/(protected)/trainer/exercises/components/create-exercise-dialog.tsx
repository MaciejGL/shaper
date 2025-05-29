'use client'

import type React from 'react'
import { useState } from 'react'
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
  useTrainerExercisesQuery,
  useUpdateExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { MuscleGroupSelector } from './muscle-group-selector'

interface CreateExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  exercise?: GQLTrainerExercisesQuery['userExercises'][number]
}

export type CreateExerciseFormData = {
  name: string
  description?: string | null
  equipment?: GQLEquipment
  videoUrl?: string | null
  muscleGroups: {
    id: string
  }[]
}

export function CreateExerciseDialog({
  open,
  onOpenChange,
  categories,
  exercise,
}: CreateExerciseDialogProps) {
  const [formData, setFormData] = useState<CreateExerciseFormData>({
    name: exercise?.name ?? '',
    description: exercise?.description ?? '',
    equipment: exercise?.equipment ?? undefined,
    videoUrl: exercise?.videoUrl ?? '',
    muscleGroups: exercise?.muscleGroups.map((mg) => ({ id: mg.id })) ?? [],
  })
  const invalidateQuery = useInvalidateQuery()

  const { mutateAsync: createExercise, isPending: isCreatingExercise } =
    useCreateExerciseMutation({
      onSuccess: () => {
        onOpenChange(false)
        toast.success('Exercise created successfully')
        invalidateQuery({
          queryKey: useTrainerExercisesQuery.getKey(),
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
          },
        })
      } else {
        await createExercise({
          input: {
            ...formData,
            muscleGroups: formData.muscleGroups.map((mg) => mg.id),
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
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to create exercise. Please try again.')
    }
  }

  const handleMuscleGroupsChange = (muscleGroups: { id: string }[]) => {
    setFormData((prev) => ({ ...prev, muscleGroups }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle="Create New Exercise"
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Create New Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise to your library that you can reuse across
            training plans.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Barbell Bench Press"
              required
            />
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
              disabled={!formData.name.trim()}
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
