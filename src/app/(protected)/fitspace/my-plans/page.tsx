'use client'

import { useQueryClient } from '@tanstack/react-query'
import { DumbbellIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useActivatePlanMutation,
  useClosePlanMutation,
  useDeletePlanMutation,
  useFitspaceMyPlansQuery,
  usePausePlanMutation,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ActivePlanTab } from './components/active-plan-tab/active-plan-tab'
import { AvailablePlansTab } from './components/available-plans-tab'
import { CompletedPlansTab } from './components/completed-plans-tab'
import { PlanActionDialog } from './components/plan-action-dialog'
import {
  ActivePlan,
  AvailablePlan,
  CompletedPlan,
  PlanAction,
  PlanTab,
} from './types'

export default function MyPlansPage() {
  const [tab, setTab] = useQueryState<PlanTab>(
    'tab',
    parseAsStringEnum<PlanTab>([
      PlanTab.Active,
      PlanTab.Available,
      PlanTab.Completed,
    ]),
  )
  const router = useRouter()

  const queryClient = useQueryClient()
  const invalidateQueries = () =>
    queryClient.invalidateQueries({ queryKey: ['FitspaceMyPlans'] })
  const { mutateAsync: activatePlan, isPending: isActivatingPlan } =
    useActivatePlanMutation({
      onSuccess: () => {
        invalidateQueries()
        toast.success('Plan activated')
        setTab(PlanTab.Active)
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
  const { data, isLoading: isLoadingPlans } = useFitspaceMyPlansQuery()
  const activePlan = data?.getMyPlansOverview?.activePlan
  const availablePlans = data?.getMyPlansOverview?.availablePlans
  const completedPlans = data?.getMyPlansOverview?.completedPlans
  const navigation = data?.getWorkout?.navigation

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: PlanAction | null
    plan: AvailablePlan | ActivePlan | CompletedPlan | null
  }>({
    isOpen: false,
    action: null,
    plan: null,
  })

  const handlePlanAction = (
    action: PlanAction,
    plan: AvailablePlan | ActivePlan | CompletedPlan,
  ) => {
    setDialogState({ isOpen: true, action, plan })
  }

  const handleConfirmAction = async (data: { startDate?: Date }) => {
    if (!dialogState.plan) return
    if (dialogState.action === 'activate' && data.startDate) {
      await activatePlan({
        planId: dialogState.plan.id,
        startDate: data.startDate.toISOString(),
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
  return (
    <div className="container-fitspace mx-auto">
      <DashboardHeader
        title="Training Plans"
        description="Manage your workout plans and track your progress"
        icon={<DumbbellIcon />}
      />

      {/* Plans Tabs */}
      <Tabs
        value={tab ?? PlanTab.Active}
        onValueChange={(value) => setTab(value as PlanTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value={PlanTab.Active}
            className="flex items-center gap-2"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value={PlanTab.Available}
            className="flex items-center gap-2"
          >
            Available
          </TabsTrigger>
          <TabsTrigger
            value={PlanTab.Completed}
            className="flex items-center gap-2"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Active Plans */}
        <TabsContent value={PlanTab.Active} className="mt-6 space-y-4">
          <ActivePlanTab
            plan={activePlan}
            navigation={navigation}
            handlePlanAction={handlePlanAction}
            loading={isLoadingPlans}
          />
        </TabsContent>

        {/* Available Plans */}
        <TabsContent value={PlanTab.Available} className="mt-6 space-y-4">
          <AvailablePlansTab
            availablePlans={availablePlans ?? []}
            handlePlanAction={handlePlanAction}
            loading={isLoadingPlans}
          />
        </TabsContent>

        {/* Completed Plans */}
        <TabsContent value={PlanTab.Completed} className="mt-6 space-y-4">
          <CompletedPlansTab
            completedPlans={completedPlans ?? []}
            handlePlanAction={handlePlanAction}
            loading={isLoadingPlans}
          />
        </TabsContent>
      </Tabs>
      {/* Action Dialog */}
      <PlanActionDialog
        isOpen={dialogState.isOpen}
        onClose={handleCloseDialog}
        action={dialogState.action}
        plan={dialogState.plan}
        onConfirm={handleConfirmAction}
        isLoading={
          isActivatingPlan || isPausingPlan || isClosingPlan || isDeletingPlan
        }
      />
    </div>
  )
}
