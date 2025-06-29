import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/types'
import { useUpdateTrainingPlanDetailsMutation } from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { useDebouncedMutationWrapper } from '@/hooks/use-debounced-mutation-wrapper'

export const useDetailsHandlers = ({
  trainingId,
  details,
  setDetails,
  setIsDirty,
}: {
  trainingId?: string
  details: TrainingPlanFormData['details']
  setDetails: React.Dispatch<
    React.SetStateAction<TrainingPlanFormData['details']>
  >
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKey: ['GetTemplateTrainingPlanById'],
    delay: 1000,
  })
  const { mutateAsync: updateTrainingPlanDetails } =
    useUpdateTrainingPlanDetailsMutation()

  // Wrap the mutation with debouncing for text inputs
  const debouncedUpdateTrainingPlanDetails = useDebouncedMutationWrapper(
    updateTrainingPlanDetails,
    {
      delay: 700, // 700ms delay for text input debouncing
      onSuccess: () => {
        setIsDirty(false)
        debouncedInvalidateQueries()
      },
      onError: (error) => {
        console.error('[Update details]: Failed to update details', {
          trainingId,
          error,
        })
        // We'll handle rollback in the individual call
      },
    },
  )

  const updateDetails = useCallback(
    async (newDetails: Partial<TrainingPlanFormData['details']>) => {
      if (isNil(trainingId)) {
        console.error('[Update details]: Invalid fields', {
          trainingId,
        })
        return
      }
      const beforeDetails = { ...details }

      // Update local state immediately for responsive UI
      setDetails((prev) => ({ ...prev, ...newDetails }))
      setIsDirty(true)

      // Use debounced mutation for API call
      debouncedUpdateTrainingPlanDetails(
        {
          input: {
            id: trainingId,
            isPublic: newDetails.isPublic,
            isDraft: newDetails.isDraft,
            title: newDetails.title,
            description: newDetails.description,
            difficulty: newDetails.difficulty,
          },
        },
        {
          // Handle error and rollback optimistic update
          onError: () => {
            setDetails(beforeDetails)
            setIsDirty(true)
          },
        },
      )
    },
    [
      setDetails,
      setIsDirty,
      debouncedUpdateTrainingPlanDetails,
      details,
      trainingId,
    ],
  )

  return {
    updateDetails,
  }
}
