import { CollapsibleText } from '@/components/collapsible-text'
import { Loader } from '@/components/loader'
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
  handlePlanAction: (action: PlanAction, plan: ActivePlan) => void
  loading: boolean
}) {
  const { currentWeek, currentDay } = getCurrentWeekAndDay(plan?.weeks)

  if (loading) {
    return (
      <div className="flex-center min-h-[500px]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="mb-20">
      {plan ? (
        <div key={plan.id}>
          <Header
            plan={plan}
            loading={loading}
            handlePlanAction={handlePlanAction}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <div className="bg-muted/40 shadow-lg dark:shadow-lg-dark dark:bg-muted/20 p-4 rounded-lg">
              <ProgressOverview
                currentWeekNumber={currentWeek?.weekNumber ?? 0}
                completedWorkoutsDays={plan.completedWorkoutsDays}
                adherence={plan.adherence}
                totalWorkouts={plan.totalWorkouts}
                weekCount={plan.weeks.length}
              />
              <div className="hidden md:block mt-6">
                <CollapsibleText text={plan.description} maxLines={10} />
              </div>
            </div>

            {currentDay && (
              <div className="bg-muted/40 shadow-lg dark:shadow-lg-dark dark:bg-muted/20 p-4 rounded-lg">
                <TodaysWorkout todaysWorkout={currentDay} planId={plan.id} />
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
