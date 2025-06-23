import { Calendar, DumbbellIcon } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GQLFitspaceDashboardQuery } from '@/generated/graphql-client'

import { TodaysWorkout } from '../../my-plans/components/active-plan-tab/todays-workout'

export type TodaysSessionProps = {
  workout?: NonNullable<
    NonNullable<GQLFitspaceDashboardQuery['getWorkout']>['plan']
  >['weeks'][number]['days'][number]
  planId?: string
}

export function TodaysSession({ workout, planId }: TodaysSessionProps) {
  if (!workout || !planId) {
    return (
      <Card className="@container/todays-session">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            What are you up to today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-center flex-col h-full">
          <div className="p-4 rounded-full bg-primary/20 ">
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
                href="/fitspace/sessions/quick-workout"
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
    <Card variant="gradient">
      <CardContent>
        <TodaysWorkout
          planId={planId}
          todaysWorkout={workout}
          isNextWorkout={false}
        />
      </CardContent>
    </Card>
  )
}
