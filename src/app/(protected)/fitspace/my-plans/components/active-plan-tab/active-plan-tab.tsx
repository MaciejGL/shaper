import { useMemo } from 'react'

import { CollapsibleText } from '@/components/collapsible-text'
import { Loader } from '@/components/loader'
import { Card, CardContent } from '@/components/ui/card'

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

  console.info('ActivePlanTab', todaysWorkout)

  return (
    <div>
      {plan && navigation ? (
        <Card key={plan.id} variant="gradient">
          <Header
            plan={plan}
            loading={loading}
            handlePlanAction={handlePlanAction}
          />
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ProgressOverview
                currentWeekNumber={navigation.currentWeekIndex}
                completedWorkoutsDays={plan.completedWorkoutsDays}
                adherence={plan.adherence}
                totalWorkouts={plan.totalWorkouts}
                weekCount={plan.weeks.length}
              />
              <div className="hidden md:block mt-6">
                <CollapsibleText text={plan.description} />
              </div>
            </div>

            {todaysWorkout && (
              <TodaysWorkout todaysWorkout={todaysWorkout} planId={plan.id} />
            )}
            <div className="block md:hidden">
              <CollapsibleText text={plan.description} />
            </div>
          </CardContent>
          <PlanDetails startDate={plan.startDate} endDate={plan.endDate} />
        </Card>
      ) : (
        <NoActivePlan />
      )}
    </div>
  )
}
