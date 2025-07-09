import { CollapsibleText } from '@/components/collapsible-text'
import { Loader } from '@/components/loader'
import { GQLTrainingPlan } from '@/generated/graphql-client'
import { getCurrentWeekAndDay } from '@/lib/get-current-week-and-day'

import { ActivePlan, PlanAction } from '../../types'

import { Header } from './header'
import { NoActivePlan } from './no-active-plan'
import { PlanDetails } from './plan-details'
import { ProgressOverview } from './progress-overview'
import { TodaysWorkout } from './todays-workout'

export function ActivePlanTab({
  plan,
  handlePlanAction,
  loading,
}: {
  plan: ActivePlan | null
  handlePlanAction: (
    action: PlanAction,
    plan: Pick<
      GQLTrainingPlan,
      'title' | 'weekCount' | 'totalWorkouts' | 'id' | 'startDate'
    > | null,
  ) => void
  loading: boolean
}) {
  const { currentWeek, currentDay, nextWorkout } = getCurrentWeekAndDay(
    plan?.weeks,
  )

  if (loading) {
    return (
      <div className="flex-center min-h-[500px]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="mb-4">
      {plan ? (
        <div key={plan.id}>
          <Header plan={plan} handlePlanAction={handlePlanAction} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <div className="p-4 rounded-lg bg-card">
              <ProgressOverview
                completedWorkouts={plan.completedWorkoutsDays}
                currentWeekNumber={currentWeek?.weekNumber ?? 0}
                completedWorkoutsThisWeek={
                  currentWeek?.days.filter((day) => day.completedAt).length ?? 0
                }
                totalWorkoutsThisWeek={
                  currentWeek?.days.filter((day) => !day.isRestDay).length ?? 0
                }
                completedWorkoutsDays={plan.completedWorkoutsDays}
                weeksCompleted={
                  plan.weeks.filter((week) => week.completedAt).length
                }
                totalWorkouts={plan.totalWorkouts}
                weekCount={plan.weeks.length}
              />
              <div className="hidden md:block mt-6">
                <p className="text-sm text-muted-foreground mb-6">
                  Plan description
                </p>
                <CollapsibleText text={plan.description} maxLines={10} />
              </div>
            </div>

            {currentDay && (
              <div className="p-4 rounded-lg bg-card">
                <TodaysWorkout
                  todaysWorkout={currentDay}
                  planId={plan.id}
                  forceExpanded
                />
              </div>
            )}
            {nextWorkout && currentDay?.isRestDay && (
              <div className="p-4 rounded-lg bg-card">
                <TodaysWorkout
                  todaysWorkout={nextWorkout}
                  planId={plan.id}
                  isNextWorkout
                  forceExpanded
                />
              </div>
            )}
            <div className="block md:hidden p-4 rounded-lg bg-card">
              <p className="text-lg font-semibold mb-6">Plan description</p>
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
