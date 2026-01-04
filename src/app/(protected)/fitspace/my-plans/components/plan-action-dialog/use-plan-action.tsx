import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { revalidatePlanPages } from '@/app/actions/revalidate'
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

  const [isSyncing, setIsSyncing] = useState(false)

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
      onError: () => {
        toast.error('Failed to pause plan, please try again.')
      },
    })
  const { mutateAsync: closePlan, isPending: isClosingPlan } =
    useClosePlanMutation({
      onError: () => {
        toast.error('Failed to close plan, please try again.')
      },
    })
  const { mutateAsync: deletePlan, isPending: isDeletingPlan } =
    useDeletePlanMutation({
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

      // For activate action, navigate immediately and close dialog
      if (isActivateAction) {
        setDialogState({ isOpen: false, action: null, plan: null })
        router.push('/fitspace/workout')
        revalidatePlanPages()
        queryInvalidation.planStateChange(queryClient)
        router.refresh()
        return
      }

      // For other actions, wait for refetches before closing dialog
      setIsSyncing(true)
      try {
        await queryInvalidation.planStateChange(queryClient)
        await queryClient.invalidateQueries({
          queryKey: ['GetCheckinStatus'],
          refetchType: 'all',
        })
        revalidatePlanPages()
        router.refresh()
      } catch (syncError) {
        console.error('Sync error:', syncError)
        toast.error('Failed to refresh plan data, please try again.')
      } finally {
        setIsSyncing(false)
        setDialogState({ isOpen: false, action: null, plan: null })
      }
    } catch (error) {
      console.error('Plan action error:', error)
      // Error handling is done in individual mutation onError callbacks
      // Keep dialog open so user can retry
    }
  }

  const isBusy =
    isActivatingPlan ||
    isPausingPlan ||
    isClosingPlan ||
    isDeletingPlan ||
    isSyncing

  const handleCloseDialog = () => {
    if (isBusy) return
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
    isSyncing,
    isBusy,
  }
}
