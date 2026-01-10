'use client'

import { ArrowRight, Calendar, Moon, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { estimateWorkoutTime } from '@/lib/workout/estimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import type { TodayWorkoutCtaProps } from './types'
import { DAY_NAMES, findTodaysWorkout } from './utils'
import { WorkoutStatsTiles } from './workout-stats-tiles'

export function TodayWorkoutCta({ weeks, startDate }: TodayWorkoutCtaProps) {
  const { day, nextWorkoutDay } = useMemo(
    () => findTodaysWorkout(weeks, startDate),
    [weeks, startDate],
  )

  const estimatedDuration = useMemo(() => {
    if (!day?.exercises?.length) return null
    return estimateWorkoutTime(day.exercises)
  }, [day])

  const nextWorkoutDuration = useMemo(() => {
    if (!nextWorkoutDay?.exercises?.length) return null
    return estimateWorkoutTime(nextWorkoutDay.exercises)
  }, [nextWorkoutDay])

  if (!day && !nextWorkoutDay) {
    return null
  }

  const isRestDay = day?.isRestDay
  const isCompleted = !!day?.completedAt

  // Rest day state
  if (isRestDay) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="size-5 text-violet-500" />
            Rest Day
          </CardTitle>
          <CardDescription>
            Enjoy your recovery! Your muscles grow stronger during rest.
          </CardDescription>
        </CardHeader>
        {nextWorkoutDay && (
          <CardContent className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-2">Next workout</p>
            <p className="font-medium">
              {formatWorkoutType(nextWorkoutDay.workoutType) ||
                DAY_NAMES[nextWorkoutDay.dayOfWeek]}
            </p>
            <p className="text-sm text-muted-foreground">
              {nextWorkoutDay.exercises?.length || 0} exercises
              {nextWorkoutDuration && ` · ${nextWorkoutDuration} min`}
            </p>
          </CardContent>
        )}
      </Card>
    )
  }

  // Completed state
  if (isCompleted && day) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-5 text-green-500" />
            Today's Workout
          </CardTitle>
          <CardAction>
            <Badge variant="success">Completed</Badge>
          </CardAction>
        </CardHeader>
        {day.exercises?.length > 0 && (
          <CardContent>
            <WorkoutStatsTiles
              variant="default"
              exercises={day.exercises}
              estimatedDuration={estimatedDuration}
            />
          </CardContent>
        )}
        <CardFooter>
          <ButtonLink
            href="/fitspace/workout"
            variant="outline"
            className="w-full"
            iconEnd={<ArrowRight />}
          >
            View Workout
          </ButtonLink>
        </CardFooter>
      </Card>
    )
  }

  // Active workout state
  if (day) {
    return (
      <Card variant="premium" className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-5 text-primary" />
            Today's Workout
          </CardTitle>
        </CardHeader>
        {day.exercises?.length > 0 && (
          <CardContent>
            <WorkoutStatsTiles
              variant="premium"
              exercises={day.exercises}
              estimatedDuration={estimatedDuration}
            />
          </CardContent>
        )}
        <CardFooter>
          <ButtonLink
            href="/fitspace/workout"
            className="w-full"
            iconEnd={<ArrowRight />}
          >
            Start Training
          </ButtonLink>
        </CardFooter>
      </Card>
    )
  }

  return null
}
