import { ArrowRight, Calendar, DumbbellIcon } from 'lucide-react'
import { Fragment } from 'react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GQLFitspaceDashboardQuery } from '@/generated/graphql-client'

export type TodaysSessionProps = {
  workout?: NonNullable<
    NonNullable<GQLFitspaceDashboardQuery['getWorkout']>['plan']
  >['weeks'][number]['days'][number]
  planId?: string
}

export function TodaysSession({ workout, planId }: TodaysSessionProps) {
  if (!workout || !planId) {
    return (
      <Card variant="gradient" className="@container/todays-session">
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="size-5" />
          Today's Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workout.isRestDay ? (
          <h3 className="font-semibold text-lg">Rest day</h3>
        ) : (
          <h3 className="font-semibold text-lg">{workout.workoutType}</h3>
        )}

        {workout.isRestDay && (
          <p className="text-sm text-muted-foreground">
            You don't have any training sessions planned for today.
          </p>
        )}

        {workout.exercises.length > 0 && (
          <div className="space-y-2 rounded-lg">
            <div className="space-y-2">
              {workout.exercises.map((exercise, index) => (
                <Fragment key={index}>
                  <div key={index} className="flex items-center gap-4">
                    <div className="grow">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets?.length || 0} sets
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {exercise?.muscleGroups
                          ?.map((group) => group.alias)
                          .join(', ')}
                      </div>
                    </div>
                  </div>
                  <Separator className="last:hidden" />
                </Fragment>
              ))}
            </div>
          </div>
        )}

        <ButtonLink
          href={`/fitspace/workout/${planId}`}
          iconEnd={<ArrowRight />}
          variant={workout.isRestDay ? 'outline' : 'default'}
        >
          {workout.isRestDay ? 'View workout' : 'Start workout'}
        </ButtonLink>
      </CardContent>
    </Card>
  )
}
