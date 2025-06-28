import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  useCreateTrainingPlanMutation,
  useDeleteTrainingPlanMutation,
  useDuplicateTrainingPlanMutation,
  useUpdateTrainingPlanMutation,
} from '@/generated/graphql-client'

export const useTrainingPlanMutations = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
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
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
      },
    })

  const { mutateAsync: deleteTrainingPlan, isPending: isDeleting } =
    useDeleteTrainingPlanMutation({
      onError: () => toast.error('Failed to delete training plan'),
      onSuccess: () => {
        toast.success('Training plan deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
        router.replace('/trainer/trainings')
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

  return {
    createTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    duplicateTrainingPlan,
    isPending,
    isUpdating,
    isDeleting,
    isDuplicating,
  }
}
