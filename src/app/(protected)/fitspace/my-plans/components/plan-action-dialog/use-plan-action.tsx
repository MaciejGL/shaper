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
  useFitspaceGetActivePlanIdQuery,
  useFitspaceGetCurrentWorkoutIdQuery,
  useFitspaceMyPlansQuery,
  usePausePlanMutation,
} from '@/generated/graphql-client'

import { PlanAction, PlanTab } from '../../types'

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
  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: useFitspaceMyPlansQuery.getKey(),
    })
    queryClient.invalidateQueries({
      queryKey: useFitspaceGetCurrentWorkoutIdQuery.getKey(),
    })
    queryClient.invalidateQueries({
      queryKey: useFitspaceGetActivePlanIdQuery.getKey(),
    })
    // if (dialogState.plan?.id) {
    //   queryClient.invalidateQueries({
    //     queryKey: useGetTrainingPlanPreviewByIdQuery.getKey({
    //       id: dialogState.plan.id,
    //     }),
    //   })
    // }
  }
  const { mutateAsync: activatePlan, isPending: isActivatingPlan } =
    useActivatePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        router.refresh()
        router.push(`/fitspace/my-plans?tab=${PlanTab.Plans}`)
      },
      onError: () => {
        toast.error('Failed to activate plan, please try again.')
      },
    })
  const { mutateAsync: pausePlan, isPending: isPausingPlan } =
    usePausePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        router.push(`/fitspace/my-plans?tab=${PlanTab.Plans}`)
      },
      onError: () => {
        toast.error('Failed to pause plan, please try again.')
      },
    })
  const { mutateAsync: closePlan, isPending: isClosingPlan } =
    useClosePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        router.push(`/fitspace/my-plans?tab=${PlanTab.Plans}`)
      },
      onError: () => {
        toast.error('Failed to close plan, please try again.')
      },
    })
  const { mutateAsync: deletePlan, isPending: isDeletingPlan } =
    useDeletePlanMutation({
      onSuccess: () => {
        invalidateQueries()
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

    try {
      if (
        (dialogState.action === 'activate' && data.startDate) ||
        (dialogState.action === 'activate' && dialogState.plan.startDate)
      ) {
        // Activate the plan
        await activatePlan({
          planId: dialogState.plan.id,
          startDate: data.startDate
            ? format(data.startDate, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          resume: dialogState.plan.startDate ? true : false,
        })

        // Create check-in schedule if requested
        if (data.scheduleCheckins && data.checkinSchedule) {
          await createCheckinSchedule({
            input: {
              frequency: data.checkinSchedule.frequency as GQLCheckinFrequency,
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
        }
      } else if (dialogState.action === 'pause') {
        await pausePlan({ planId: dialogState.plan.id })
      } else if (dialogState.action === 'close') {
        await closePlan({ planId: dialogState.plan.id })
      } else if (dialogState.action === 'delete') {
        await deletePlan({ planId: dialogState.plan.id })
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
