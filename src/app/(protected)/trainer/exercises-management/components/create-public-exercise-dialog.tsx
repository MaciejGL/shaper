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
import { MultiImageUpload } from '@/components/ui/multi-image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import {
  GQLEquipment,
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
} from '@/generated/graphql-client'

import { MuscleGroupSelector } from '../../exercises/components/muscle-group-selector'
import { SubstituteExercisesManager } from '../../exercises/components/substitute-exercises-manager'

interface CreatePublicExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  publicExercises?: GQLTrainerExercisesQuery['publicExercises']
  onExerciseCreated?: () => void
}

export type CreatePublicExerciseFormData = {
  name: string
  description?: string | null
  equipment?: GQLEquipment
  videoUrl?: string | null
  muscleGroups: { id: string }[]
  secondaryMuscleGroups: { id: string }[]
  substituteIds: string[]
  imageUrls: string[]
  isPremium: boolean
}

export function CreatePublicExerciseDialog({
  open,
  onOpenChange,
  categories,
  publicExercises,
  onExerciseCreated,
}: CreatePublicExerciseDialogProps) {
  const [formData, setFormData] = useState<CreatePublicExerciseFormData>({
    name: '',
    description: '',
    equipment: undefined,
    videoUrl: '',
    muscleGroups: [],
    secondaryMuscleGroups: [],
    substituteIds: [],
    imageUrls: [],
    isPremium: false,
  })

  const [isCreating, setIsCreating] = useState(false)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        equipment: undefined,
        videoUrl: '',
        muscleGroups: [],
        secondaryMuscleGroups: [],
        substituteIds: [],
        imageUrls: [],
        isPremium: false,
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setIsCreating(true)

      const response = await fetch('/api/moderator/exercises/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          equipment: formData.equipment,
          videoUrl: formData.videoUrl,
          muscleGroups: formData.muscleGroups.map((mg) => mg.id),
          secondaryMuscleGroups: formData.secondaryMuscleGroups.map(
            (mg) => mg.id,
          ),
          substituteIds: formData.substituteIds,
          imageUrls: formData.imageUrls,
          isPremium: formData.isPremium,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create exercise')
      }

      await response.json()
      toast.success('Public exercise created successfully')
      onOpenChange(false)
      onExerciseCreated?.()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create exercise. Please try again.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handlePrimaryMuscleGroupsChange = (muscleGroups: { id: string }[]) => {
    setFormData((prev) => ({ ...prev, muscleGroups }))
  }

  const handleSecondaryMuscleGroupsChange = (
    secondaryMuscleGroups: { id: string }[],
  ) => {
    setFormData((prev) => ({ ...prev, secondaryMuscleGroups }))
  }

  const isNameTakenError = useMemo(() => {
    if (
      publicExercises?.some(
        (e) =>
          e.name.trim().toLowerCase() === formData.name.trim().toLowerCase(),
      )
    ) {
      return 'An exercise with this name already exists in the public library.'
    }
    return undefined
  }, [publicExercises, formData.name])

  const canSubmit =
    formData.name.trim() &&
    formData.muscleGroups.length > 0 &&
    !isNameTakenError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle="Create Public Exercise"
        fullScreen
        className="sm:max-w-[900px]"
      >
        <DialogHeader>
          <DialogTitle>Create Public Exercise</DialogTitle>
          <DialogDescription>
            Add a new exercise to the public library that will be available to
            all users.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto hide-scrollbar"
        >
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
              errorMessage={isNameTakenError}
            />
            {isNameTakenError && (
              <p className="text-sm text-red-500">{isNameTakenError}</p>
            )}
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
            <MuscleGroupSelector
              categories={categories}
              selectedPrimaryMuscleGroups={formData.muscleGroups}
              selectedSecondaryMuscleGroups={formData.secondaryMuscleGroups}
              onPrimaryMuscleGroupsChange={handlePrimaryMuscleGroupsChange}
              onSecondaryMuscleGroupsChange={handleSecondaryMuscleGroupsChange}
            />
            {formData.muscleGroups.length === 0 && (
              <p className="text-sm text-red-500">
                At least one muscle group is required
              </p>
            )}
          </div>

          <div className="space-y-2">
            <SubstituteExercisesManager
              selectedMuscleGroupIds={
                formData.muscleGroups.length > 0
                  ? formData.muscleGroups.map((mg) => mg.id)
                  : (categories?.map((mg) => mg.id) ?? [])
              }
              availableExercises={{
                userExercises: [], // Moderators only work with public exercises
                publicExercises: publicExercises || [],
              }}
              selectedSubstituteIds={formData.substituteIds}
              onSubstitutesChange={(substituteIds: string[]) => {
                setFormData((prev) => ({ ...prev, substituteIds }))
              }}
              isLoading={false}
            />
          </div>

          <div className="space-y-2">
            <Label>Exercise Images</Label>
            <MultiImageUpload
              imageType="exercise"
              currentImageUrls={formData.imageUrls}
              onImagesChange={(imageUrls: string[]) => {
                setFormData((prev) => ({ ...prev, imageUrls }))
              }}
              maxImages={4}
              disabled={isCreating}
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
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPremium: checked }))
                }
              />
              <Label htmlFor="isPremium">Premium Exercise</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium exercises are only available to users with premium
              subscriptions
            </p>
          </div>
        </form>

        <DialogFooter className="flex flex-row gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="ml-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isCreating}
          >
            Create Public Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
