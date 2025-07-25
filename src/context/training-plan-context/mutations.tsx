import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  // Add/remove operations
  useDeleteTrainingPlanMutation,
  useDuplicateTrainingPlanMutation,
  // Granular update mutations - more efficient than full plan updates
  // Keep the full update for fallback/final submission
} from '@/generated/graphql-client'

export const useTrainingPlanMutations = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

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
    // Main operations
    deleteTrainingPlan,
    duplicateTrainingPlan,

    // Loading states
    isDeleting,
    isDuplicating,
  }
}
