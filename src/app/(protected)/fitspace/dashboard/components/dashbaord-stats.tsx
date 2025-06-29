'use client'

import { secondsToMinutes } from 'date-fns'
import {
  Activity,
  BadgeCheck,
  CalendarDaysIcon,
  Clock4Icon,
  DrumstickIcon,
  DumbbellIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react'
import Link from 'next/link'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { StatsItem } from '@/components/stats-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GQLFitspaceDashboardQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

export type DashboardStatsProps = {
  plan?: NonNullable<
    NonNullable<GQLFitspaceDashboardQuery['getWorkout']>['plan']
  >
  currentWeek?: NonNullable<
    NonNullable<GQLFitspaceDashboardQuery['getWorkout']>['plan']
  >['weeks'][number]
}

export function DashboardStats({ plan, currentWeek }: DashboardStatsProps) {
  if (!plan || !currentWeek) {
    return null
  }

  const workoutsThisWeekCompleted = currentWeek.days.filter(
    (day) => day.completedAt,
  ).length

  const workoutsThisWeekGoal = currentWeek.days.filter(
    (day) => !day.isRestDay,
  ).length

  const streak = calculateStreak({
    currentWeekIndex: plan.weeks.findIndex(
      (week) => week.id === currentWeek.id,
    ),
    currentDayIndex: plan.weeks.findIndex((week) => week.id === currentWeek.id),
    weeks: plan.weeks,
  })

  const totalDuration = currentWeek.days.reduce(
    (acc, day) => acc + (day.duration ?? 0),
    0,
  )

  const weightLogLastWeek = 83
  const weightLogCurrentWeek = 82

  const diffWeight = weightLogCurrentWeek - weightLogLastWeek

  return (
    <div className="space-y-6 -mx-2 md:-mx-0">
      <Card className="rounded-none md:rounded-lg py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 py-4">
            <StatsItem
              value={streak}
              label="Day Streak"
              icon={<CalendarDaysIcon className="size-4 text-amber-500" />}
            />

            <StatsItem
              value={
                <div className="text-2xl font-bold">
                  {secondsToMinutes(totalDuration)}
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              }
              icon={<Clock4Icon className="size-4 text-blue-500" />}
              label="Gym time"
            />
            <StatsItem
              value={
                <div className="text-2xl font-bold flex items-baseline gap-1">
                  {weightLogCurrentWeek}
                  {diffWeight !== 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <p>
                        {diffWeight > 0 ? '+' : '-'}
                        {Math.abs(diffWeight)}kg
                      </p>
                    </div>
                  )}
                </div>
              }
              icon={
                diffWeight > 0 ? (
                  <TrendingUpIcon className="size-4 text-green-500" />
                ) : (
                  <TrendingDownIcon className="size-4 text-cyan-500" />
                )
              }
              label="Weight trend"
            />
          </div>

          <div className="space-y-4 pt-2 border-t border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Workouts This Week</span>
              <span className="font-medium">
                {workoutsThisWeekCompleted} of {workoutsThisWeekGoal} workouts
              </span>
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {currentWeek.days.map((day, index) => (
                <Link
                  href={
                    day.isRestDay
                      ? '#'
                      : `/fitspace/workout/${plan.id}?week=${currentWeek.id}&day=${day.id}&exercise=${day.exercises.at(0)?.id}`
                  }
                  key={index}
                  className="shrink-0"
                >
                  <div
                    className={cn(
                      'rounded-md shadow-neuro-light dark:shadow-neuro-dark shrink-0 p-3 min-w-[5rem]',
                      !day.isRestDay && 'bg-primary-foreground',
                      day.isRestDay &&
                        'bg-muted-foreground/10 text-muted-foreground',
                    )}
                  >
                    <div className="flex-center flex-col gap-1 text-xs md:text-md text-center">
                      {day.completedAt && (
                        <BadgeCheck className={cn('size-4 text-green-500')} />
                      )}
                      {!day.completedAt && !day.isRestDay && (
                        <DumbbellIcon className={cn('size-4 text-amber-600')} />
                      )}
                      {day.isRestDay && (
                        <DrumstickIcon className="size-4 text-muted-foreground" />
                      )}
                      <span>{getDayName(day.dayOfWeek, { short: true })}</span>
                      <span className="font-medium truncate">
                        {day.workoutType?.split(' ').at(0) ?? 'Rest'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const calculateStreak = ({
  currentWeekIndex,
  currentDayIndex,
  weeks,
}: {
  currentWeekIndex: number
  currentDayIndex: number
  weeks: NonNullable<
    NonNullable<GQLFitspaceDashboardQuery['getWorkout']>['plan']
  >['weeks']
}): number => {
  let streak = 0
  let currentWeek = currentWeekIndex
  let currentDay = currentDayIndex

  // Start from current day and go backwards
  while (currentWeek >= 0) {
    const week = weeks[currentWeek]
    if (!week) break

    // For the current week, only check days up to currentDay
    // For previous weeks, check all days
    const daysToCheck =
      currentWeek === currentWeekIndex
        ? week.days.slice(0, currentDay + 1)
        : week.days

    // Check days in reverse order
    for (let i = daysToCheck.length - 1; i >= 0; i--) {
      const day = daysToCheck[i]

      // Skip if day is not completed
      if (!day.completedAt) {
        return streak
      }

      // If we found a completed day, increment streak
      streak++
    }

    // Move to previous week
    currentWeek--
    // For previous weeks, we check all days
    currentDay = (weeks[currentWeek]?.days.length ?? 0) - 1
  }

  return streak
}
