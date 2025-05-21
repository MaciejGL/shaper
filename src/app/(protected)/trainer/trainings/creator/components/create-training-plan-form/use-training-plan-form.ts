import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  useCreateTrainingPlanMutation,
  useDeleteTrainingPlanMutation,
  useDuplicateTrainingPlanMutation,
  useGetTemplateTrainingPlanByIdQuery,
  useUpdateTrainingPlanMutation,
} from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../types'

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
        isRestDay: [0, 6].includes(i),
        exercises: [],
      })),
    },
  ],
}

export const useTrainingPlanForm = (trainingId?: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] =
    useState<TrainingPlanFormData>(initialFormData)
  const [isDirty, setIsDirty] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(1)

  const { data: templateTrainingPlan, isLoading: isLoadingInitialData } =
    useGetTemplateTrainingPlanByIdQuery(
      { id: trainingId! },
      {
        enabled: !!trainingId,
        refetchOnMount: 'always',
        select: (data) => ({
          details: {
            title: data.getTrainingPlanById.title,
            description: data.getTrainingPlanById.description,
            isPublic: data.getTrainingPlanById.isPublic,
            isTemplate: data.getTrainingPlanById.isTemplate,
          },
          weeks: data.getTrainingPlanById.weeks,
        }),
      },
    )

  useEffect(() => {
    if (templateTrainingPlan) {
      setFormData(templateTrainingPlan)
      setIsDirty(false)
    }
  }, [templateTrainingPlan])

  const { mutateAsync: createTrainingPlan, isPending } =
    useCreateTrainingPlanMutation({
      onError: () => toast.error('Failed to create training plan'),
      onSuccess: () => {
        toast.success('Training plan created successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
      },
    })

  const { mutateAsync: updateTrainingPlan, isPending: isUpdating } =
    useUpdateTrainingPlanMutation({
      onError: () => toast.error('Failed to update training plan'),
      onSuccess: () => {
        toast.success('Training plan updated successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
      },
    })

  const { mutateAsync: deleteTrainingPlan, isPending: isDeleting } =
    useDeleteTrainingPlanMutation({
      onError: () => toast.error('Failed to delete training plan'),
      onSuccess: () => {
        toast.success('Training plan deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.replace('/trainer/trainings/creator/new')
      },
    })

  const { mutateAsync: duplicateTrainingPlan, isPending: isDuplicating } =
    useDuplicateTrainingPlanMutation({
      onError: () => toast.error('Failed to duplicate training plan'),
      onSuccess: (data) => {
        toast.success('Training plan duplicated successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.push(`/trainer/trainings/creator/${data.duplicateTrainingPlan}`)
      },
    })

  const clearDraft = () => {
    setFormData(templateTrainingPlan || initialFormData)
    setIsDirty(false)
  }

  const updateFormData = (newData: Partial<TrainingPlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
    setIsDirty(true)
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
      await createTrainingPlan({
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

  return {
    formData,
    isDirty,
    currentStep,
    activeWeek,
    activeDay,
    isLoadingInitialData,
    isPending,
    isUpdating,
    isDeleting,
    isDuplicating,
    setCurrentStep,
    setActiveWeek,
    setActiveDay,
    updateFormData,
    clearDraft,
    handleSubmit,
    handleDelete: async (trainingId: string) =>
      deleteTrainingPlan({ id: trainingId }),
    handleDuplicate: async (trainingId: string) =>
      duplicateTrainingPlan({ id: trainingId }),
  }
}
