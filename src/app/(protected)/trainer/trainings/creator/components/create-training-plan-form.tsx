'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  RefreshCcwIcon,
  Save,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useCreateTrainingPlanMutation,
  useDeleteTrainingPlanMutation,
  useDuplicateTrainingPlanMutation,
  useGetTemplateTrainingPlanByIdQuery,
  useUpdateTrainingPlanMutation,
} from '@/generated/graphql-client'

import { DaysSetup } from './days-setup'
import { ExercisesSetup } from './exercises-setup'
import { PlanDetailsForm } from './plan-details-form'
import { ReviewPlan } from './review-plan'
import { TrainingPlanFormData } from './types'
import { WeeksSetup } from './weeks-setup'

const initialFormData: TrainingPlanFormData = {
  details: {
    title: '',
    description: '',
    isPublic: false,
    isTemplate: false,
  },
  weeks: [
    {
      id: 'cmaod14o30004uhht6c7ldfx23',
      weekNumber: 1,
      name: 'Week 1',
      description: '',
      days: Array.from({ length: 7 }, (_, i) => ({
        id: 'cmaod14o30004uhht6c7ldfx2' + i,
        dayOfWeek: i,
        isRestDay: [0, 6].includes(i), // Default rest days on Sunday and Saturday
        exercises: [],
      })),
    },
  ],
}

const steps = ['details', 'weeks', 'days', 'exercises', 'review']

export function CreateTrainingPlanForm({
  trainingId,
}: {
  trainingId?: string
}) {
  const router = useRouter()
  const { data: templateTrainingPlan, isLoading: isLoadingInitialData } =
    useGetTemplateTrainingPlanByIdQuery(
      { id: trainingId! },
      {
        enabled: !!trainingId,
        refetchOnMount: 'always',
        select: (data) => {
          return {
            details: {
              title: data.getTrainingPlanById.title,
              description: data.getTrainingPlanById.description,
              isPublic: data.getTrainingPlanById.isPublic,
              isTemplate: data.getTrainingPlanById.isTemplate,
            },
            weeks: data.getTrainingPlanById.weeks,
          }
        },
      },
    )

  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<TrainingPlanFormData>(
    templateTrainingPlan || initialFormData,
  )
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (templateTrainingPlan) {
      setFormData(templateTrainingPlan)
      setIsDirty(false) // Reset dirty state when new data is loaded
    }
  }, [templateTrainingPlan])

  const [currentStep, setCurrentStep] = useState(0)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(1) // Monday by default
  const { mutateAsync, isPending } = useCreateTrainingPlanMutation({
    onError: () => {
      toast.error('Failed to create training plan')
    },
    onSuccess: () => {
      toast.success('Training plan created successfully')
      queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
    },
  })

  const { mutateAsync: updateTrainingPlan, isPending: isUpdating } =
    useUpdateTrainingPlanMutation({
      onError: () => {
        toast.error('Failed to update training plan')
      },
      onSuccess: () => {
        toast.success('Training plan updated successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
      },
    })

  const { mutateAsync: deleteTrainingPlan, isPending: isDeleting } =
    useDeleteTrainingPlanMutation({
      onError: () => {
        toast.error('Failed to delete training plan')
      },
      onSuccess: () => {
        toast.success('Training plan deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.replace('/trainer/trainings/creator/new')
      },
    })

  const { mutateAsync: duplicateTrainingPlan, isPending: isDuplicating } =
    useDuplicateTrainingPlanMutation({
      onError: () => {
        toast.error('Failed to duplicate training plan')
      },
      onSuccess: (data) => {
        toast.success('Training plan duplicated successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.push(`/trainer/trainings/creator/${data.duplicateTrainingPlan}`)
      },
    })

  // Clear draft from localStorage
  const clearDraft = () => {
    setFormData(templateTrainingPlan || initialFormData)
    setIsDirty(false)
  }

  const updateFormData = (newData: Partial<TrainingPlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
    setIsDirty(true)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (trainingId) {
      await updateTrainingPlan({
        input: {
          id: trainingId,
          isPublic: formData.details.isPublic,
          isTemplate: formData.details.isTemplate,
          title: formData.details.title,
          description: formData.details.description,
          weeks: formData.weeks,
        },
      })
    } else {
      await mutateAsync({
        input: {
          isPublic: formData.details.isPublic,
          isTemplate: formData.details.isTemplate,
          title: formData.details.title,
          description: formData.details.description,
          weeks: formData.weeks,
        },
      })
      router.refresh()
      clearDraft()
    }
  }
  const handleDelete = async () => {
    if (trainingId) {
      await deleteTrainingPlan({ id: trainingId })
      router.replace('/trainer/trainings/creator/new')
    }
  }

  if (isLoadingInitialData) {
    return <div>Loading...</div>
  }

  return (
    <AnimatedPageTransition id="create-training-plan-form">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Training Plan
        </h1>
        <div className="flex justify-end gap-2 items-center">
          {isDirty && (
            <p className="text-sm text-muted-foreground">Unsaved changes</p>
          )}
          {trainingId && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDuplicating || isDeleting || isPending}
              iconOnly={<Trash2 />}
            >
              Delete
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={clearDraft}
            className="ml-2"
            disabled={
              isPending || isUpdating || isDuplicating || isDeleting || !isDirty
            }
            iconOnly={<RefreshCcwIcon />}
          />
          {trainingId && (
            <Button
              variant="ghost"
              onClick={() => duplicateTrainingPlan({ id: trainingId! })}
              iconOnly={<Copy />}
              disabled={isDuplicating || isDeleting || isPending}
              loading={isDuplicating}
            >
              Duplicate
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleSubmit}
            iconStart={<Save />}
            loading={isPending || isUpdating}
            disabled={isDuplicating || isDeleting || isPending}
          >
            Save Plan
          </Button>
        </div>
      </div>
      <Card className="p-6">
        <Tabs
          value={steps[currentStep]}
          className="w-full"
          onValueChange={(value) => {
            const newStep = steps.indexOf(value)
            if (newStep >= 0) {
              setCurrentStep(newStep)
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-5 dark:bg-primary-foreground">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="weeks">Weeks</TabsTrigger>
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="py-4">
            <AnimatedPageTransition id="plan-details">
              <PlanDetailsForm
                data={formData.details}
                updateData={(details) => updateFormData({ details })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="weeks" className="py-4">
            <AnimatedPageTransition id="weeks">
              <WeeksSetup
                weeks={formData.weeks}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="days" className="py-4">
            <AnimatedPageTransition id="days">
              <DaysSetup
                weeks={formData.weeks}
                activeWeek={activeWeek}
                setActiveWeek={setActiveWeek}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="exercises" className="py-4">
            <AnimatedPageTransition id="exercises">
              <ExercisesSetup
                weeks={formData.weeks}
                activeWeek={activeWeek}
                setActiveWeek={setActiveWeek}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="review" className="py-4">
            <AnimatedPageTransition id="review">
              <ReviewPlan formData={formData} />
            </AnimatedPageTransition>
          </TabsContent>
        </Tabs>

        <div className="flex mt-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              iconStart={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          )}

          {currentStep === steps.length - 1 ? null : (
            <Button
              onClick={handleNext}
              iconEnd={<ChevronRight className="h-4 w-4" />}
              className="ml-auto"
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </AnimatedPageTransition>
  )
}
