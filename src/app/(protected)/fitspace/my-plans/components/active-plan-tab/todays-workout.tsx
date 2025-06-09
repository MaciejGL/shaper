import { ArrowRight, ClockIcon, DumbbellIcon, HamIcon } from 'lucide-react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { ActivePlan, WorkoutNavigation } from '../../types'

export function TodaysWorkout({
  plan,
  navigation,
}: {
  plan: NonNullable<ActivePlan>
  navigation: WorkoutNavigation
}) {
  if (
    !plan ||
    !plan.weeks ||
    !plan.weeks[navigation.currentWeekIndex] ||
    !plan.weeks[navigation.currentWeekIndex].days
  ) {
    return null
  }
  const day =
    plan.weeks[navigation.currentWeekIndex].days[navigation.currentDayIndex]

  if (!day) {
    return null
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-semibold">Today's workout</p>
        <ButtonLink
          href={`/fitspace/workout/${plan.id}`}
          iconEnd={<ArrowRight />}
        >
          Start workout
        </ButtonLink>
      </div>
      {day.isRestDay ? <RestDay /> : <WorkoutDay day={day} />}
    </div>
  )
}

function WorkoutDay({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  return (
    <div className="w-full space-y-6 mt-6">
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
      <h2 className="text-xl font-semibold text-foreground">
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
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Exercises</p>
      <div className="space-y-2 bg-muted rounded-md p-4">
        {day.exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex justify-between items-start py-1"
          >
            <div className="flex-1 pr-4">
              <p className="text-foreground leading-tight text-sm">
                {exercise.name}
              </p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {exercise.sets.length} sets
            </div>
          </div>
        ))}
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
    <div className="px-4 py-8 shadow-lg bg-muted rounded-lg flex flex-col items-center">
      <BiggyIcon icon={HamIcon} size="md" />
      <span className="text-muted-foreground text-center max-w-[25ch]">
        Rest, eat, sleep and recover muscles for next workout!
      </span>
    </div>
  )
}
