'use client'

import { Plus, Sparkles, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Divider } from '@/components/divider'
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
import { Textarea } from '@/components/ui/textarea'
import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import {
  GQLEquipment,
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
  useCreateExerciseMutation,
  useDeleteExerciseMutation,
  useGetExerciseWithSubstitutesQuery,
  useTrainerExercisesQuery,
  useUpdateExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { MuscleGroupSelector } from './muscle-group-selector'
import { SubstituteExercisesManager } from './substitute-exercises-manager'
import { useGenerateExerciseAI } from './use-generate-exercise-ai'

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
  instructions: string[]
  tips: string[]
  equipment?: GQLEquipment
  videoUrl?: string | null
  muscleGroups: { id: string }[]
  secondaryMuscleGroups: { id: string }[]
  substituteIds: string[]
  imageUrls: string[]
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
    instructions: exercise?.instructions ?? ['', ''],
    tips: exercise?.tips ?? [],
    equipment: exercise?.equipment ?? undefined,
    videoUrl: exercise?.videoUrl ?? '',
    muscleGroups: exercise?.muscleGroups.map((mg) => ({ id: mg.id })) ?? [],
    secondaryMuscleGroups:
      exercise?.secondaryMuscleGroups?.map((mg) => ({ id: mg.id })) ?? [],
    substituteIds: [],
    imageUrls: [],
  })

  // Track original image URLs to detect changes
  const [originalImageUrls, setOriginalImageUrls] = useState<string[]>([])

  // AI generation
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false)
  const { generate: generateAI, isGenerating } = useGenerateExerciseAI({
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        name: data.suggestedName,
        description: data.description,
        instructions: data.instructions,
        tips: data.tips,
        muscleGroups: data.primaryMuscleIds.map((id) => ({ id })),
        secondaryMuscleGroups: data.secondaryMuscleIds.map((id) => ({ id })),
        equipment: data.equipment as GQLEquipment,
        substituteIds: data.suggestedSubstituteIds,
      }))
      toast.success('Exercise content generated')
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const hasExistingContent =
    !!formData.description?.trim() ||
    formData.instructions.some((i) => i.trim()) ||
    formData.tips.length > 0 ||
    formData.muscleGroups.length > 0 ||
    formData.secondaryMuscleGroups.length > 0

  const handleGenerateAI = () => {
    if (hasExistingContent) {
      setShowOverwriteConfirm(true)
    } else {
      generateAI(formData.name)
    }
  }

  const handleConfirmOverwrite = () => {
    setShowOverwriteConfirm(false)
    generateAI(formData.name)
  }

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
    // Load existing images if available
    if (exerciseWithSubstitutes?.exercise?.images) {
      const existingImageUrls = exerciseWithSubstitutes.exercise.images.map(
        (img) => img.url,
      )
      setOriginalImageUrls(existingImageUrls)
      setFormData((prev) => ({
        ...prev,
        imageUrls: existingImageUrls,
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

  const { mutateAsync: deleteExercise, isPending: isDeletingExercise } =
    useDeleteExerciseMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useTrainerExercisesQuery.getKey(),
        })
        toast.success('Exercise deleted successfully')
        onOpenChange(false)
      },
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    // Trim and filter out empty strings from instructions and tips
    const filteredInstructions = formData.instructions
      .map((instruction) => instruction.trim())
      .filter((instruction) => instruction !== '')
    const filteredTips = formData.tips
      .map((tip) => tip.trim())
      .filter((tip) => tip !== '')

    // Check if images have changed (for updates only)
    const imagesChanged =
      exercise?.id &&
      (formData.imageUrls.length !== originalImageUrls.length ||
        formData.imageUrls.some((url, idx) => url !== originalImageUrls[idx]))

    // Prepare base cleaned data
    const baseData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      videoUrl: formData.videoUrl?.trim() || null,
      equipment: formData.equipment,
      instructions: filteredInstructions,
      tips: filteredTips,
      muscleGroups: formData.muscleGroups.map((mg) => mg.id),
      secondaryMuscleGroups: formData.secondaryMuscleGroups.map((mg) => mg.id),
      substituteIds: formData.substituteIds,
    }

    // Only include imageUrls if:
    // - Creating new exercise (no exercise.id), OR
    // - Updating and images have changed
    const cleanedData =
      !exercise?.id || imagesChanged
        ? { ...baseData, imageUrls: formData.imageUrls }
        : baseData

    try {
      if (exercise?.id) {
        await updateExercise({
          id: exercise.id,
          input: cleanedData,
        })
      } else {
        await createExercise({
          input: cleanedData,
        })
      }
      // Reset form
      setFormData({
        name: '',
        description: '',
        instructions: ['', ''],
        tips: [],
        equipment: undefined,
        videoUrl: '',
        muscleGroups: [],
        secondaryMuscleGroups: [],
        substituteIds: [],
        imageUrls: [],
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to create exercise. Please try again.')
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
        fullScreen
        className="sm:max-w-[900px] !pb-0 !px-0"
      >
        <DialogHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconStart={<Sparkles />}
              onClick={handleGenerateAI}
              disabled={!formData.name.trim() || isGenerating}
              loading={isGenerating}
            >
              Generate with AI
            </Button>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="px-6 pt-6 overflow-y-auto hide-scrollbar"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
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
                  errorMessage={
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
            </div>
          </div>

          <Divider className="my-8" />

          {/* Instructions & Tips */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Instructions & Tips
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
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
                    className="min-h-42"
                  />
                </div>

                <div className="grid grid-cols-1  gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starting-position">Starting Position</Label>
                    <Textarea
                      id="starting-position"
                      variant="ghost"
                      value={formData.instructions[0] ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          instructions: [
                            e.target.value,
                            prev.instructions[1] ?? '',
                          ],
                        }))
                      }
                      placeholder="Describe the starting position..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="execution">Execution</Label>
                    <Textarea
                      id="execution"
                      variant="ghost"
                      value={formData.instructions[1] ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          instructions: [
                            prev.instructions[0] ?? '',
                            e.target.value,
                          ],
                        }))
                      }
                      placeholder="Describe how to execute the movement..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-6">
                  <Label>Tips</Label>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    iconOnly={<Plus />}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tips: [...prev.tips, ''],
                      }))
                    }
                  >
                    Add Tip
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Training cues, common mistakes, coaching points
                </span>
                {formData.tips.length > 0 && (
                  <div className="space-y-2 w-full">
                    {formData.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_auto] gap-2 items-center w-full"
                      >
                        <Input
                          id={`tip-${index}`}
                          variant="ghost"
                          value={tip}
                          onChange={(e) => {
                            const newTips = [...formData.tips]
                            newTips[index] = e.target.value
                            setFormData((prev) => ({ ...prev, tips: newTips }))
                          }}
                          placeholder={`Tip ${index + 1}`}
                          className="flex-1 grow"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-md"
                          iconOnly={<X />}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              tips: prev.tips.filter((_, i) => i !== index),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-8" />

          {/* Muscle Groups & Targeting */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Muscle Groups & Substitutes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <MuscleGroupSelector
                  categories={categories}
                  selectedPrimaryMuscleGroups={formData.muscleGroups}
                  selectedSecondaryMuscleGroups={formData.secondaryMuscleGroups}
                  onPrimaryMuscleGroupsChange={handlePrimaryMuscleGroupsChange}
                  onSecondaryMuscleGroupsChange={
                    handleSecondaryMuscleGroupsChange
                  }
                />
              </div>

              <div className="space-y-2">
                <SubstituteExercisesManager
                  exerciseId={exercise?.id}
                  selectedMuscleGroupIds={
                    formData.muscleGroups.length > 0
                      ? formData.muscleGroups.map((mg) => mg.id)
                      : (categories?.map((mg) => mg.id) ?? [])
                  }
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
            </div>
          </div>

          <Divider className="my-8" />

          {/* Media & Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
              Media & Resources
            </h3>
            <div className="space-y-2.5">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">
                  Video URL
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    YouTube, Vimeo, or direct link
                  </span>
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  variant="secondary"
                  value={formData.videoUrl ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/watch?v=..."
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
                  disabled={isCreatingExercise || isUpdatingExercise}
                />
              </div>
            </div>
          </div>
        </form>
        <DialogFooter className="flex flex-row gap-2 border-t p-4">
          {exercise?.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteExercise({ id: exercise.id })}
              disabled={
                isDeletingExercise ||
                isLoadingExerciseWithSubstitutes ||
                isCreatingExercise ||
                isUpdatingExercise
              }
              loading={isDeletingExercise}
              className="mr-auto"
            >
              Remove Exercise
            </Button>
          )}
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
            disabled={
              !formData.name.trim() || isNameTakenError?.level === 'user'
            }
            loading={isCreatingExercise || isUpdatingExercise}
          >
            {exercise?.id ? 'Update Exercise' : 'Create Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog
        open={showOverwriteConfirm}
        onOpenChange={setShowOverwriteConfirm}
      >
        <DialogContent dialogTitle="Overwrite existing content?">
          <DialogHeader>
            <DialogTitle>Overwrite existing content?</DialogTitle>
            <DialogDescription>
              This exercise already has content filled in. Generating with AI
              will replace the description, instructions, tips, and muscle
              groups.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowOverwriteConfirm(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmOverwrite}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
