import { format } from 'date-fns'
import {
  ArrowRight,
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  HamIcon,
} from 'lucide-react'
import { Fragment } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Separator } from '@/components/ui/separator'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { ActivePlan } from '../../types'

export function TodaysWorkout({
  todaysWorkout,
  planId,
  isNextWorkout,
}: {
  todaysWorkout: NonNullable<ActivePlan>['weeks'][number]['days'][number]
  planId: string
  isNextWorkout?: boolean
}) {
  if (!todaysWorkout || !planId) {
    return null
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-lg font-semibold">
            {isNextWorkout ? "Next's workout" : "Today's workout"}
          </p>
          {isNextWorkout && todaysWorkout.scheduledAt && (
            <p className="text-sm text-muted-foreground">
              {format(todaysWorkout.scheduledAt, 'EEEE, d. MMMM')}
            </p>
          )}
        </div>
        {!todaysWorkout.isRestDay && (
          <ButtonLink
            href={`/fitspace/workout/${planId}`}
            iconEnd={<ArrowRight />}
          >
            Start
          </ButtonLink>
        )}
      </div>
      {todaysWorkout.isRestDay ? (
        <RestDay />
      ) : (
        <WorkoutDay day={todaysWorkout} />
      )}
    </div>
  )
}

function WorkoutDay({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  return (
    <div className="w-full space-y-6 mt-12">
      <WorkoutDayHeader day={day} />
      <WorkoutDayExercises day={day} />
      <WorkoutDaySummary day={day} />
    </div>
  )
}

function WorkoutDayHeader({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  const estimatedTime = estimateWorkoutTime(day.exercises)

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold text-foreground">
        {formatWorkoutType(day.workoutType)}
      </h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="flex items-center gap-1">
          <DumbbellIcon />
          <span>{day.exercises.length} exercises</span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <ClockIcon />
          <span>~{estimatedTime}min</span>
        </Badge>
      </div>
    </div>
  )
}

function WorkoutDayExercises({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Exercises</h2>
      <div className="space-y-2 bg-muted rounded-lg p-4">
        <div className="space-y-2">
          {day.exercises.map((exercise, index) => (
            <Fragment key={index}>
              <div key={index} className="flex items-center gap-4">
                {exercise.completedAt && (
                  <CheckIcon className="size-4 text-green-500" />
                )}
                <div className="grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{exercise.name}</p>
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
    </div>
  )
}

function WorkoutDaySummary({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  const totalSets = day.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
  return (
    <div className="bg-muted rounded-md p-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Total sets:</span>
        <span className="font-semibold text-foreground">{totalSets}</span>
      </div>
    </div>
  )
}

function RestDay() {
  return (
    <div className="px-4 py-8 flex flex-col gap-4 items-center">
      <BiggyIcon icon={HamIcon} size="md" />
      <span className="text-muted-foreground text-sm text-center max-w-[25ch]">
        Rest and recover for next workout!
      </span>
    </div>
  )
}
