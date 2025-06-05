import { Calendar, DumbbellIcon } from 'lucide-react'
import { Play } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GQLMuscleGroup } from '@/generated/graphql-client'

export type TodaysSessionProps = {
  nextWorkoutDay?: {
    id: string
    date: string
    workoutType: string
    isRestDay: boolean
    muscleGroups: Pick<GQLMuscleGroup, 'name'>[]
  }
}

export function TodaysSession({ nextWorkoutDay }: TodaysSessionProps) {
  if (!nextWorkoutDay) {
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
                href="/fitspace/sessions/quick-start"
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Workout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">{nextWorkoutDay.workoutType}</h3>
          <div className="flex gap-2 mt-2">
            {nextWorkoutDay.muscleGroups.map((group) => (
              <Badge variant="outline" key={group.name}>
                {group.name}
              </Badge>
            ))}
          </div>
        </div>
        <Button className="w-full" size="lg" iconEnd={<Play />}>
          Start Training
        </Button>
      </CardContent>
    </Card>
  )
}
