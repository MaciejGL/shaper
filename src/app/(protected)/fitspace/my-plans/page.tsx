'use client'

import { LayoutList } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitspaceMyPlansQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ActivePlanTab } from './components/active-plan-tab/active-plan-tab'
import { AvailablePlansTab } from './components/available-plans-tab'
import { CompletedPlansTab } from './components/completed-plans-tab'
import { PlanActionDialog } from './components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from './components/plan-action-dialog/use-plan-action'
import { PlanTab } from './types'

export default function MyPlansPage() {
  const [tab, setTab] = useQueryState<PlanTab>(
    'tab',
    parseAsStringEnum<PlanTab>([
      PlanTab.Active,
      PlanTab.Available,
      PlanTab.Completed,
    ]),
  )

  const {
    dialogState,
    handlePlanAction,
    handleConfirmAction,
    handleCloseDialog,
    isActivatingPlan,
    isPausingPlan,
    isClosingPlan,
    isDeletingPlan,
  } = usePlanAction()

  const { data, isLoading: isLoadingPlans } = useFitspaceMyPlansQuery()
  const activePlan = data?.getMyPlansOverview?.activePlan
  const availablePlans = data?.getMyPlansOverview?.availablePlans
  const completedPlans = data?.getMyPlansOverview?.completedPlans

  return (
    <div className="container-fitspace mx-auto">
      <DashboardHeader title="Training Plans" icon={<LayoutList />} />

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
