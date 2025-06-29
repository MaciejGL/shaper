import { isNil } from 'lodash'
import { useCallback } from 'react'

import { TrainingPlanFormData } from '@/app/(protected)/trainer/trainings/creator-old/components/types'
import { useUpdateTrainingPlanDetailsMutation } from '@/generated/graphql-client'

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
  const { mutateAsync: updateTrainingPlanDetails } =
    useUpdateTrainingPlanDetailsMutation()
  const updateDetails = useCallback(
    async (newDetails: Partial<TrainingPlanFormData['details']>) => {
      if (isNil(trainingId)) {
        console.error('[Update details]: Invalid fields', {
          trainingId,
        })
        return
      }
      const beforeDetails = { ...details }
      setDetails((prev) => ({ ...prev, ...newDetails }))
      setIsDirty(true)
      updateTrainingPlanDetails(
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
          onSuccess: () => {
            setIsDirty(false)
          },
          onError: () => {
            console.error('[Update details]: Failed to update details', {
              trainingId,
            })
            setDetails(beforeDetails)
            setIsDirty(true)
          },
        },
      )
    },
    [setDetails, setIsDirty, updateTrainingPlanDetails, details, trainingId],
  )

  return {
    updateDetails,
  }
}
