'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { ExtendHeader } from '@/components/extend-header'
import { HeaderTab } from '@/components/header-tab'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  useFitspaceMyPlansQuery,
  useGetCheckinStatusQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { CustomPlansTab } from './components/custom-plans-tab'
import { ExercisesTab } from './components/exercises-tab'
import { NoActivePlanHeaderCard } from './components/no-active-plan-header-card/no-active-plan-header-card'
import { PlanActionDialog } from './components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from './components/plan-action-dialog/use-plan-action'
import { PlanCard } from './components/plan-card'
import { PlanDetailsDrawer } from './components/plan-details-drawer'
import { PlansTab } from './components/plans-tab'
// import { TodayWorkoutCta } from './components/summary/today-workout-cta/today-workout-cta'
import { PlanTab, getPlanStatus } from './types'
import { getPlanImage } from './utils'

export default function MyPlansPage() {
  const [tab, setTab] = useQueryState<PlanTab>(
    'tab',
    parseAsStringEnum<PlanTab>([
      PlanTab.AssignedPlans,
      PlanTab.CustomPlans,
      PlanTab.Exercises,
    ]),
  )

  const [isActivePlanDrawerOpen, setIsActivePlanDrawerOpen] = useState(false)

  const {
    dialogState,
    handlePlanAction,
    handleConfirmAction,
    handleCloseDialog,
    isBusy,
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
      value={tab ?? PlanTab.AssignedPlans}
      defaultValue={PlanTab.AssignedPlans}
      onValueChange={(value) => setTab(value as PlanTab)}
      className="gap-0"
    >
      <div className="-mt-6 relative z-10 max-w-screen px-3">
        <PrimaryTabList
          options={[
            { label: 'Assigned', value: PlanTab.AssignedPlans },
            { label: 'Custom', value: PlanTab.CustomPlans },
            { label: 'Exercises', value: PlanTab.Exercises },
          ]}
          onClick={setTab}
          active={tab ?? PlanTab.AssignedPlans}
          size="lg"
          className="grid grid-cols-[auto_auto_auto] max-w-full"
          classNameButton={cn('px-2 [min-width:370px]:px-3 gap-0')}
        />
      </div>

      <TabsContent
        id="my-plans-content"
        value={PlanTab.AssignedPlans}
        className="space-y-4 py-6 px-4"
      >
        <HeaderTab
          title="Assigned plans"
          description="Plans you have been assigned to by your trainer or from our library."
        />
        {/* {activePlan?.weeks && activePlan.weeks.length > 0 && (
          <div className="mb-6">
            <TodayWorkoutCta
              weeks={activePlan.weeks}
              startDate={activePlan.startDate ?? null}
            />
          </div>
        )} */}
        <PlansTab
          activePlan={activePlan}
          availablePlans={availablePlans}
          completedPlans={completedPlans}
          handlePlanAction={handlePlanAction}
          loading={isLoadingPlans}
        />
      </TabsContent>

      <TabsContent value={PlanTab.CustomPlans} className="space-y-4 py-6 px-4">
        <CustomPlansTab />
      </TabsContent>

      <TabsContent value={PlanTab.Exercises} className="space-y-4 py-6 px-4">
        <ExercisesTab />
      </TabsContent>
    </Tabs>
  )

  return (
    <>
      <ExtendHeader
        classNameContent="px-0 pt-0 relative"
        classNameHeaderContent="p-4 pb-12"
        headerChildren={
          activePlan ? (
            <PlanCard
              plan={activePlan}
              onClick={handleActivePlanClick}
              status={getPlanStatus(activePlan, activePlan.active)}
              imageUrl={getPlanImage(activePlan)}
            />
          ) : isLoadingPlans ? (
            <div className="dark">
              <LoadingSkeleton count={1} variant="md" className="h-[120px]" />
            </div>
          ) : (
            <div className="dark">
              <NoActivePlanHeaderCard
                availablePlans={availablePlans ?? []}
                onSelectPlan={(plan) => handlePlanAction('activate', plan)}
              />
            </div>
          )
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
        isLoading={isBusy}
        hasCheckinSchedule={checkinData?.checkinStatus?.hasSchedule}
      />
    </>
  )
}
