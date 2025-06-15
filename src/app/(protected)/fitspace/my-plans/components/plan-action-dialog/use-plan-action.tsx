import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  GQLTrainingPlan,
  useActivatePlanMutation,
  useClosePlanMutation,
  useDeletePlanMutation,
  usePausePlanMutation,
} from '@/generated/graphql-client'

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
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['FitspaceMyPlans'] })
    queryClient.invalidateQueries({ queryKey: ['FitspaceGetCurrentWorkoutId'] })
    queryClient.invalidateQueries({
      queryKey: ['FitspaceGetTrainingPlanPreviewById'],
    })
  }
  const { mutateAsync: activatePlan, isPending: isActivatingPlan } =
    useActivatePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        toast.success('Plan activated')
        // setTab(PlanTab.Active)
        router.refresh()
      },
    })
  const { mutateAsync: pausePlan, isPending: isPausingPlan } =
    usePausePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        toast.success('Plan paused')
      },
    })
  const { mutateAsync: closePlan, isPending: isClosingPlan } =
    useClosePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        toast.success('Plan closed')
      },
    })
  const { mutateAsync: deletePlan, isPending: isDeletingPlan } =
    useDeletePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        toast.success('Plan deleted')
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

  const handleConfirmAction = async (data: { startDate?: Date }) => {
    if (!dialogState.plan) return
    if (dialogState.action === 'activate' && data.startDate) {
      await activatePlan({
        planId: dialogState.plan.id,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        resume: dialogState.plan.startDate ? true : false,
      })
    } else if (dialogState.action === 'pause') {
      await pausePlan({ planId: dialogState.plan.id })
    } else if (dialogState.action === 'close') {
      await closePlan({ planId: dialogState.plan.id })
    } else if (dialogState.action === 'delete') {
      await deletePlan({ planId: dialogState.plan.id })
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
