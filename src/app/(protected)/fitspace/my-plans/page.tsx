'use client'

import { LayoutList } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
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
  const quickWorkoutPlan = data?.getMyPlansOverviewFull?.quickWorkoutPlan

  return (
    <div className="container-hypertro mx-auto mb-24">
      <DashboardHeader title="Training Plans" icon={<LayoutList />} />

      {/* Plans Tabs */}
      <Tabs
        value={tab ?? PlanTab.QuickWorkout}
        onValueChange={(value) => setTab(value as PlanTab)}
        className="w-full"
      >
        <PrimaryTabList
          options={[
            { label: 'Workouts', value: PlanTab.QuickWorkout },
            { label: 'Plans', value: PlanTab.Plans },
          ]}
          onClick={setTab}
          active={tab ?? (activePlan ? PlanTab.Plans : PlanTab.QuickWorkout)}
        />

        {/* Enhanced Quick Workout Plan with Favourites */}
        <TabsContent value={PlanTab.QuickWorkout} className="space-y-4">
          <EnhancedQuickWorkoutTab
            plan={quickWorkoutPlan}
            loading={isLoadingPlans}
          />
        </TabsContent>

        {/* Training Plans - Unified View */}
        <TabsContent value={PlanTab.Plans} className="space-y-4">
          <PlansTab
            activePlan={activePlan}
            availablePlans={availablePlans}
            completedPlans={completedPlans}
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
