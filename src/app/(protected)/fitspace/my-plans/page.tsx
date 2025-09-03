'use client'

import { LayoutList } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFitspaceMyPlansQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { PlanActionDialog } from './components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from './components/plan-action-dialog/use-plan-action'
import { PlansTab } from './components/plans-tab'
import { EnhancedQuickWorkoutTab } from './components/quick-workout-plan-tab/enhanced-quick-workout-tab'
import { PlanTab } from './types'

export default function MyPlansPage() {
  const [tab, setTab] = useQueryState<PlanTab>(
    'tab',
    parseAsStringEnum<PlanTab>([PlanTab.Plans, PlanTab.QuickWorkout]),
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
  const activePlan = data?.getMyPlansOverviewFull?.activePlan
  const availablePlans = data?.getMyPlansOverviewFull?.availablePlans
  const completedPlans = data?.getMyPlansOverviewFull?.completedPlans

  return (
    <div className="container-hypertro mx-auto grid grid-rows-[max-content_1fr]">
      <DashboardHeader
        title="Training Plans"
        icon={LayoutList}
        variant="amber"
        className="mb-6"
      />

      <Tabs
        value={tab ?? PlanTab.QuickWorkout}
        defaultValue={PlanTab.QuickWorkout}
        onValueChange={(value) => setTab(value as PlanTab)}
        className="gap-0 rounded-xl"
      >
        <TabsList size="lg" className="w-full">
          <TabsTrigger value={PlanTab.QuickWorkout}>Workout Days</TabsTrigger>
          <TabsTrigger value={PlanTab.Plans}>Plans</TabsTrigger>
        </TabsList>

        <TabsContent
          value={PlanTab.QuickWorkout}
          className="space-y-4 pt-4 pb-4"
        >
          <EnhancedQuickWorkoutTab />
        </TabsContent>

        <TabsContent value={PlanTab.Plans} className="space-y-4 pt-4 pb-4">
          <PlansTab
            activePlan={activePlan}
            availablePlans={availablePlans}
            completedPlans={completedPlans}
            handlePlanAction={handlePlanAction}
            loading={isLoadingPlans}
          />
        </TabsContent>
      </Tabs>

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
