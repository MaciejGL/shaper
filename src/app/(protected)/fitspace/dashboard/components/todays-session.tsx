import { Calendar, DumbbellIcon } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GQLFitspaceDashboardGetWorkoutQuery } from '@/generated/graphql-client'
import { getCurrentWeekAndDay } from '@/lib/get-current-week-and-day'

import { TodaysWorkout } from '../../my-plans/components/active-plan-tab/todays-workout'

export type TodaysSessionProps = {
  plan?: NonNullable<
    NonNullable<GQLFitspaceDashboardGetWorkoutQuery['getWorkout']>['plan']
  >
}

export function TodaysSession({ plan }: TodaysSessionProps) {
  const { currentDay } = getCurrentWeekAndDay(plan?.weeks)
  if (!plan) {
    return (
      <Card className="@container/todays-session" variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            What are you up to today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-center flex-col h-full">
          <div className="p-4 rounded-full bg-primary/20">
            <DumbbellIcon className="h-10 w-10" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            You don't have any training sessions planned for today.
          </p>

          <div>
            <div className="flex gap-2">
              <ButtonLink href="/fitspace/my-plans" variant="outline">
                Activate plan
              </ButtonLink>
              <ButtonLink
                href="/fitspace/workout/quick-workout"
                variant="default"
              >
                Start quick session
              </ButtonLink>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary">
      <CardContent>
        <TodaysWorkout planId={plan.id} todaysWorkout={currentDay} />
      </CardContent>
    </Card>
  )
}

export const TodaysSessionSkeleton = () => {
  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-24" />
      </CardHeader>
      <CardContent className="space-y-4 flex-col h-full">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  )
}
