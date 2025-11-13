import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  GQLCheckinFrequency,
  GQLTrainingPlan,
  useActivatePlanMutation,
  useClosePlanMutation,
  useCreateCheckinScheduleMutation,
  useDeletePlanMutation,
  usePausePlanMutation,
} from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'

import { PlanAction } from '../../types'

export function usePlanAction() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: PlanAction | null
    plan: Pick<
      GQLTrainingPlan,
      'title' | 'weekCount' | 'totalWorkouts' | 'id' | 'startDate'
    > | null
  }>({
    isOpen: false,
    action: null,
    plan: null,
  })

  const router = useRouter()

  const queryClient = useQueryClient()

  const { mutateAsync: activatePlan, isPending: isActivatingPlan } =
    useActivatePlanMutation({
      onError: () => {
        toast.error('Failed to activate plan, please try again.')
      },
    })
  const { mutateAsync: pausePlan, isPending: isPausingPlan } =
    usePausePlanMutation({
      onSuccess: async () => {
        await queryInvalidation.planStateChange(queryClient)
        router.refresh()
      },
      onError: () => {
        toast.error('Failed to pause plan, please try again.')
      },
    })
  const { mutateAsync: closePlan, isPending: isClosingPlan } =
    useClosePlanMutation({
      onSuccess: async () => {
        await queryInvalidation.planStateChange(queryClient)
        router.refresh()
      },
      onError: () => {
        toast.error('Failed to close plan, please try again.')
      },
    })
  const { mutateAsync: deletePlan, isPending: isDeletingPlan } =
    useDeletePlanMutation({
      onSuccess: async () => {
        await queryInvalidation.planStateChange(queryClient)
        router.refresh()
      },
      onError: () => {
        toast.error('Failed to delete plan, please try again.')
      },
    })

  const { mutateAsync: createCheckinSchedule } =
    useCreateCheckinScheduleMutation({
      onError: () => {
        toast.error('Failed to create check-in schedule')
      },
    })

  const handlePlanAction = (
    action: PlanAction,
    plan: Pick<
      GQLTrainingPlan,
      'title' | 'weekCount' | 'totalWorkouts' | 'id' | 'startDate'
    > | null,
  ) => {
    setDialogState({ isOpen: true, action, plan })
  }

  const handleConfirmAction = async (data: {
    startDate?: Date
    scheduleCheckins?: boolean
    checkinSchedule?: {
      frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
      dayOfWeek?: number
      dayOfMonth?: number
    }
  }) => {
    if (!dialogState.plan) return

    const isActivateAction =
      dialogState.action === 'activate' &&
      (data.startDate || dialogState.plan.startDate)

    try {
      if (isActivateAction) {
        await Promise.all([
          activatePlan({
            planId: dialogState.plan.id,
            startDate: data.startDate
              ? format(data.startDate, 'yyyy-MM-dd')
              : format(new Date(), 'yyyy-MM-dd'),
            resume: dialogState.plan.startDate ? true : false,
          }),
          data.scheduleCheckins && data.checkinSchedule
            ? createCheckinSchedule({
                input: {
                  frequency: data.checkinSchedule
                    .frequency as GQLCheckinFrequency,
                  dayOfWeek:
                    data.checkinSchedule.frequency !== 'MONTHLY'
                      ? data.checkinSchedule.dayOfWeek
                      : undefined,
                  dayOfMonth:
                    data.checkinSchedule.frequency === 'MONTHLY'
                      ? data.checkinSchedule.dayOfMonth
                      : undefined,
                },
              })
            : Promise.resolve(),
        ])
      } else if (dialogState.action === 'pause') {
        await pausePlan({ planId: dialogState.plan.id })
      } else if (dialogState.action === 'close') {
        await closePlan({ planId: dialogState.plan.id })
      } else if (dialogState.action === 'delete') {
        await deletePlan({ planId: dialogState.plan.id })
      }
      await queryInvalidation.planStateChange(queryClient)
      router.refresh()
      if (isActivateAction) {
        router.push('/fitspace/workout')
      }
    } catch (error) {
      console.error('Plan action error:', error)
      // Error handling is done in individual mutation onError callbacks
    }

    setDialogState({ isOpen: false, action: null, plan: null })
  }

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, action: null, plan: null })
  }

  return {
    dialogState,
    handlePlanAction,
    handleConfirmAction,
    handleCloseDialog,
    isActivatingPlan,
    isPausingPlan,
    isClosingPlan,
    isDeletingPlan,
  }
}
