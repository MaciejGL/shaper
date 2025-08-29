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
        className="gap-0 rounded-xl -mx-2"
      >
        <PrimaryTabList
          options={[
            { label: 'Workouts', value: PlanTab.QuickWorkout },
            { label: 'Plans', value: PlanTab.Plans },
          ]}
          onClick={setTab}
          active={tab ?? PlanTab.QuickWorkout}
          className="grid grid-cols-2 py-1 mb-0"
        />

        <TabsContent
          value={PlanTab.QuickWorkout}
          className="space-y-4 px-2 pt-4 bg-primary/4 dark:bg-card-on-card/60 rounded-b-xl pb-4"
        >
          <EnhancedQuickWorkoutTab />
        </TabsContent>

        <TabsContent
          value={PlanTab.Plans}
          className="space-y-4 px-2 pt-4 bg-primary/4 dark:bg-card-on-card/60 rounded-b-xl pb-4"
        >
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
