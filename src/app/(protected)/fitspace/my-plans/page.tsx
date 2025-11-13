'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { ExtendHeader } from '@/components/extend-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  useFitspaceMyPlansQuery,
  useGetCheckinStatusQuery,
} from '@/generated/graphql-client'

import { PlanActionDialog } from './components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from './components/plan-action-dialog/use-plan-action'
import { PlanCard } from './components/plan-card'
import { PlanDetailsDrawer } from './components/plan-details-drawer'
import { PlansTab } from './components/plans-tab'
import { EnhancedQuickWorkoutTab } from './components/quick-workout-plan-tab/enhanced-quick-workout-tab'
import { PlanTab, getPlanStatus } from './types'

export default function MyPlansPage() {
  const [tab, setTab] = useQueryState<PlanTab>(
    'tab',
    parseAsStringEnum<PlanTab>([PlanTab.Plans, PlanTab.QuickWorkout]),
  )

  const [isActivePlanDrawerOpen, setIsActivePlanDrawerOpen] = useState(false)

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

  const handleActivePlanClick = () => {
    setIsActivePlanDrawerOpen(true)
  }

  const handleActivePlanAction = (
    action: 'activate' | 'pause' | 'close' | 'delete',
  ) => {
    if (!activePlan) return
    handlePlanAction(action, activePlan)
    setIsActivePlanDrawerOpen(false)
  }

  const tabsContent = (
    <Tabs
      value={tab ?? PlanTab.Plans}
      defaultValue={PlanTab.Plans}
      onValueChange={(value) => setTab(value as PlanTab)}
      className="gap-0"
    >
      <PrimaryTabList
        options={[
          { label: 'Plans', value: PlanTab.Plans },
          { label: 'Custom Days', value: PlanTab.QuickWorkout },
        ]}
        onClick={setTab}
        active={tab ?? PlanTab.Plans}
        size="lg"
        className="grid grid-cols-2"
      />

      <TabsContent value={PlanTab.Plans} className="space-y-4 py-6 px-4">
        <PlansTab
          activePlan={activePlan}
          availablePlans={availablePlans}
          completedPlans={completedPlans}
          handlePlanAction={handlePlanAction}
          loading={isLoadingPlans}
        />
      </TabsContent>

      <TabsContent value={PlanTab.QuickWorkout} className="space-y-4 py-6 px-4">
        <EnhancedQuickWorkoutTab />
      </TabsContent>
    </Tabs>
  )

  return (
    <>
      <ExtendHeader
        classNameContent="px-0 pt-0"
        headerChildren={
          activePlan ? (
            <div className="dark space-y-6 pb-6 pt-4">
              <PlanCard
                plan={activePlan}
                onClick={handleActivePlanClick}
                status={getPlanStatus(activePlan, activePlan.active)}
              />
            </div>
          ) : isLoadingPlans ? (
            <div className="dark space-y-6 pb-6 pt-4">
              <LoadingSkeleton count={1} variant="md" className="h-[120px]" />
            </div>
          ) : null
        }
      >
        {tabsContent}
      </ExtendHeader>

      <PlanDetailsDrawer
        plan={activePlan}
        isActive={true}
        open={isActivePlanDrawerOpen}
        onClose={() => setIsActivePlanDrawerOpen(false)}
        onAction={handleActivePlanAction}
        isLoading={isLoadingPlans}
      />

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
    </>
  )
}
