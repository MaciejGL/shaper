'use client'

import { LayoutList } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useFitspaceMyPlansQuery,
  useGetCheckinStatusQuery,
} from '@/generated/graphql-client'

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
  const { data: checkinData } = useGetCheckinStatusQuery()
  const activePlan = data?.getMyPlansOverviewFull?.activePlan
  const availablePlans = data?.getMyPlansOverviewFull?.availablePlans
  const completedPlans = data?.getMyPlansOverviewFull?.completedPlans

  return (
    <div className="container-hypertro mx-auto grid grid-rows-[max-content_1fr] pt-2">
      <Tabs
        value={tab ?? PlanTab.Plans}
        defaultValue={PlanTab.Plans}
        onValueChange={(value) => setTab(value as PlanTab)}
        className="gap-0"
      >
        <TabsList size="lg" className="w-full">
          <TabsTrigger value={PlanTab.Plans}>Plans</TabsTrigger>
          <TabsTrigger value={PlanTab.QuickWorkout}>Custom Days</TabsTrigger>
        </TabsList>

        <TabsContent value={PlanTab.Plans} className="space-y-4 pt-4 pb-4">
          <PlansTab
            activePlan={activePlan}
            availablePlans={availablePlans}
            completedPlans={completedPlans}
            handlePlanAction={handlePlanAction}
            loading={isLoadingPlans}
          />
        </TabsContent>

        <TabsContent
          value={PlanTab.QuickWorkout}
          className="space-y-4 pt-4 pb-4"
        >
          <EnhancedQuickWorkoutTab />
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
        hasCheckinSchedule={checkinData?.checkinStatus?.hasSchedule}
      />
    </div>
  )
}
