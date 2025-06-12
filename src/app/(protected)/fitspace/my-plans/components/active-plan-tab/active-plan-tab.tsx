import { useMemo } from 'react'

import { CollapsibleText } from '@/components/collapsible-text'
import { Loader } from '@/components/loader'

import { ActivePlan, PlanAction, WorkoutNavigation } from '../../types'

import { Header } from './header'
import { NoActivePlan } from './no-active-plan'
import { PlanDetails } from './plan-details'
import { ProgressOverview } from './progress-overview'
import { TodaysWorkout } from './todays-workout'

export function ActivePlanTab({
  plan,
  navigation,
  handlePlanAction,
  loading,
}: {
  plan: ActivePlan | null
  navigation?: WorkoutNavigation | null
  handlePlanAction: (action: PlanAction, plan: ActivePlan) => void
  loading: boolean
}) {
  const todaysWorkout = useMemo(() => {
    if (
      !plan ||
      !navigation ||
      !plan.weeks ||
      !plan.weeks[navigation.currentWeekIndex] ||
      !plan.weeks[navigation.currentWeekIndex]?.days
    ) {
      return null
    }
    const day =
      plan.weeks[navigation.currentWeekIndex]?.days[navigation.currentDayIndex]

    if (!day) {
      return null
    }

    return day
  }, [plan, navigation])

  if (loading) {
    return (
      <div className="flex-center min-h-[500px]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="mb-20">
      {plan && navigation ? (
        <div key={plan.id}>
          <Header
            plan={plan}
            loading={loading}
            handlePlanAction={handlePlanAction}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <div className="bg-muted/40 shadow-lg dark:shadow-lg-dark dark:bg-muted/20 p-4 rounded-lg">
              <ProgressOverview
                currentWeekNumber={navigation.currentWeekIndex + 1}
                completedWorkoutsDays={plan.completedWorkoutsDays}
                adherence={plan.adherence}
                totalWorkouts={plan.totalWorkouts}
                weekCount={plan.weeks.length}
              />
              <div className="hidden md:block mt-6">
                <CollapsibleText text={plan.description} maxLines={10} />
              </div>
            </div>

            {todaysWorkout && (
              <div className="bg-muted/40 shadow-lg dark:shadow-lg-dark dark:bg-muted/20 p-4 rounded-lg">
                <TodaysWorkout todaysWorkout={todaysWorkout} planId={plan.id} />
              </div>
            )}
            <div className="block md:hidden mb-4">
              <CollapsibleText text={plan.description} maxLines={8} />
            </div>
          </div>
          <PlanDetails startDate={plan.startDate} endDate={plan.endDate} />
        </div>
      ) : (
        <NoActivePlan />
      )}
    </div>
  )
}
