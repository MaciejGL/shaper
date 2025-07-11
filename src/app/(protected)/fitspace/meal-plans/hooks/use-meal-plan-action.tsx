import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  useFitspaceActivateMealPlanMutation,
  useFitspaceDeactivateMealPlanMutation,
  useFitspaceDeleteMealPlanMutation,
  useFitspaceGetCurrentMealPlanIdQuery,
  useFitspaceMealPlansOverviewQuery,
} from '@/generated/graphql-client'

import { ActiveMealPlan, AvailableMealPlan, MealPlanAction } from '../types'

export function useMealPlanAction() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: MealPlanAction | null
    plan: ActiveMealPlan | AvailableMealPlan | null
  }>({
    isOpen: false,
    action: null,
    plan: null,
  })

  const router = useRouter()
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: useFitspaceMealPlansOverviewQuery.getKey(),
    })
    queryClient.invalidateQueries({
      queryKey: useFitspaceGetCurrentMealPlanIdQuery.getKey(),
    })
  }

  const { mutateAsync: activateMealPlan, isPending: isActivating } =
    useFitspaceActivateMealPlanMutation({
      onSuccess: () => {
        invalidateQueries()
        router.refresh()
        if (dialogState.plan) {
          router.push(`/fitspace/meal-plan/${dialogState.plan.id}`)
        }
      },
    })

  const { mutateAsync: deactivateMealPlan, isPending: isDeactivating } =
    useFitspaceDeactivateMealPlanMutation({
      onSuccess: () => {
        invalidateQueries()

        router.refresh()
      },
    })

  const { mutateAsync: deleteMealPlan, isPending: isDeleting } =
    useFitspaceDeleteMealPlanMutation({
      onSuccess: () => {
        invalidateQueries()
      },
    })

  const handleMealPlanAction = (
    action: MealPlanAction,
    plan: ActiveMealPlan | AvailableMealPlan,
  ) => {
    setDialogState({ isOpen: true, action, plan })
  }

  const handleConfirmAction = async () => {
    if (!dialogState.plan) return

    if (dialogState.action === 'activate') {
      await activateMealPlan({ planId: dialogState.plan.id })
    } else if (dialogState.action === 'deactivate') {
      await deactivateMealPlan({ planId: dialogState.plan.id })
    } else if (dialogState.action === 'delete') {
      await deleteMealPlan({ planId: dialogState.plan.id })
    }

    setDialogState({ isOpen: false, action: null, plan: null })
  }

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, action: null, plan: null })
  }

  return {
    dialogState,
    handleMealPlanAction,
    handleConfirmAction,
    handleCloseDialog,
    isActivating,
    isDeactivating,
    isDeleting,
  }
}
