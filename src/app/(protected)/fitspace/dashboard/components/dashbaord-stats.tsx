'use client'

import { secondsToMinutes } from 'date-fns'
import {
  Activity,
  BadgeCheck,
  CalendarDaysIcon,
  Clock4Icon,
  DrumstickIcon,
  DumbbellIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { StatsItem } from '@/components/stats-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLFitspaceDashboardGetWorkoutQuery } from '@/generated/graphql-client'
import { useScrollToItem } from '@/hooks/use-scroll-to-item'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { getCurrentWeekAndDay } from '@/lib/get-current-week-and-day'
import { cn } from '@/lib/utils'

export type DashboardStatsProps = {
  plan?: NonNullable<
    NonNullable<GQLFitspaceDashboardGetWorkoutQuery['getWorkout']>['plan']
  >
}

export function DashboardStats({ plan }: DashboardStatsProps) {
  const { preferences } = useUserPreferences()
  const { currentWeek, currentDay } = getCurrentWeekAndDay(
    plan?.weeks,
    preferences.weekStartsOn,
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Sort days based on user preference
  const sortedDays = currentWeek
    ? sortDaysForDisplay(currentWeek.days, preferences.weekStartsOn)
    : []

  // Find the current day index in the sorted array for scroll positioning
  const currentDayIndex = currentDay
    ? sortedDays.findIndex((day) => day.id === currentDay.id)
    : 0

  useScrollToItem({
    containerRef: scrollContainerRef,
    currentIndex: currentDayIndex,
    itemCount: sortedDays.length,
    itemWidth: 80 + 8, // min-w-[5rem] (80px) + gap-2 (8px)
    itemSelector: '.day-card',
    dependencies: [plan?.id, currentDay?.id, preferences.weekStartsOn],
    scrollDelay: 100,
  })

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

  return (
    <div className="space-y-6">
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Activity} variant="blue" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 border-b border-border/50 pb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Workouts This Week</span>
              <span className="font-medium">
                {workoutsThisWeekCompleted} of {workoutsThisWeekGoal} workouts
              </span>
            </div>
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide py-2 -mx-4 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-2">
                {sortedDays.map((day, index) => {
                  return (
                    <Link
                      href={
                        day.isRestDay
                          ? '#'
                          : `/fitspace/workout/${plan.id}?week=${currentWeek.id}&day=${day.id}&exercise=${day.exercises.at(0)?.id}`
                      }
                      key={index}
                      className="shrink-0 last:pr-4"
                    >
                      <div
                        className={cn(
                          'day-card rounded-md shrink-0 p-3 min-w-[5rem]',
                          !day.isRestDay && 'bg-primary/6',
                          day.isRestDay && 'bg-muted/20 text-muted-foreground',
                          day.dayOfWeek === currentDay?.dayOfWeek &&
                            'ring-1 ring-primary/20',
                        )}
                      >
                        <div className="flex-center flex-col gap-1 text-xs md:text-md text-center">
                          {day.completedAt && (
                            <BadgeCheck
                              className={cn('size-4 text-green-500')}
                            />
                          )}
                          {!day.completedAt && !day.isRestDay && (
                            <DumbbellIcon
                              className={cn('size-4 text-amber-600')}
                            />
                          )}
                          {day.isRestDay && (
                            <DrumstickIcon className="size-4 text-muted-foreground" />
                          )}
                          <span>
                            {getDayName(day.dayOfWeek, { short: true })}
                          </span>
                          <span className="font-medium truncate">
                            {day.workoutType?.split(' ').at(0) ?? 'Rest'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
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
    NonNullable<GQLFitspaceDashboardGetWorkoutQuery['getWorkout']>['plan']
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
