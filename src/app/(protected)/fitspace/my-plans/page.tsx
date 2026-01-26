'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'

import { Divider } from '@/components/divider'
import { ExtendHeader } from '@/components/extend-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  useFitspaceMyPlansQuery,
  useGetCheckinStatusQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { CoachingPlans } from './components/coaching-plans'
import { CustomPlansTab } from './components/custom-plans-tab'
import { ExercisesTab } from './components/exercises-tab'
import { NoActivePlanHeaderCard } from './components/no-active-plan-header-card/no-active-plan-header-card'
import { PlanActionDialog } from './components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from './components/plan-action-dialog/use-plan-action'
import { PlanCard } from './components/plan-card'
import { PlanDetailsDrawer } from './components/plan-details-drawer'
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

  const defaultTab = PlanTab.CustomPlans

  const safeTab = useMemo(() => {
    const selected = tab ?? defaultTab
    // Backward-compatible: old links used `tab=plans` (AssignedPlans)
    if (selected === PlanTab.AssignedPlans) return PlanTab.CustomPlans
    return selected
  }, [defaultTab, tab])

  useEffect(() => {
    if (tab === PlanTab.AssignedPlans) {
      void setTab(PlanTab.CustomPlans)
    }
  }, [setTab, tab])

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

  const tabOptions = [
    { label: 'Plans', value: PlanTab.CustomPlans },
    { label: 'Exercises', value: PlanTab.Exercises },
  ]

  const tabsContent = (
    <Tabs
      value={safeTab}
      defaultValue={defaultTab}
      onValueChange={(value) => setTab(value as PlanTab)}
      className="gap-0"
    >
      <div className="-mt-6 relative z-10 max-w-screen px-3">
        <PrimaryTabList
          options={tabOptions}
          onClick={setTab}
          active={safeTab}
          size="lg"
          className="grid max-w-full grid-cols-2"
          classNameButton={cn('px-2 [min-width:370px]:px-3 gap-0 flex-1')}
        />
      </div>

      <TabsContent value={PlanTab.CustomPlans} className="space-y-10 py-6 px-4">
        <CustomPlansTab />
        <Divider className="my-8" />
        <CoachingPlans
          activePlan={activePlan}
          availablePlans={availablePlans}
          completedPlans={completedPlans}
          handlePlanAction={handlePlanAction}
          loading={isLoadingPlans}
        />
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
