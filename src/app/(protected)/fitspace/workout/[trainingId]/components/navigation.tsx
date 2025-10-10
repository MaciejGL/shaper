'use client'

import { formatDate } from 'date-fns'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { useUserPreferences } from '@/context/user-preferences-context'
import { sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { useWorkoutPrefetch } from '../hooks/use-workout-prefetch'

import { CalendarWeekSelector } from './calendar-week-selector'
import { getDefaultSelection } from './navigation-utils'
import { NavigationDay, NavigationPlan } from './workout-page.client'

interface NavigationProps {
  plan?: NavigationPlan | null
}

export function Navigation({ plan }: NavigationProps) {
  if (!plan) return null

  return (
    <div
      className={cn(
        'bg-sidebar rounded-b-xl',
        // Counter Main padding
        '-mx-2 md:-mx-4 lg:-mx-8 -mt-2 md:-mt-4 lg:-mt-8',
        'px-2 py-4 md:px-4 lg:p-8',
      )}
    >
      <div className="mx-auto max-w-sm">
        <WeekSelector plan={plan} />
        <DaySelector plan={plan} />
      </div>
    </div>
  )
}

function Day({ day, isSelected }: { day: NavigationDay; isSelected: boolean }) {
  const [, setActiveDayId] = useQueryState('day')

  const handleClick = () => {
    setActiveDayId(day.id)
  }

  const isDayCompleted = day.completedAt
  const completionRate = isDayCompleted ? 1 : 0

  return (
    <div>
      <button
        data-selected={isSelected}
        className={cn(
          'size-12 shrink-0 rounded-md flex-center flex-col text-primary transition-all bg-primary/5 dark:bg-secondary dark:text-primary cursor-pointer hover:bg-secondary/80',
          'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground dark:data-[selected=true]:bg-primary dark:data-[selected=true]:text-primary-foreground shadow-xs',
        )}
        onClick={handleClick}
      >
        <span className="text-xs">
          {getDayName(day.dayOfWeek, { short: true })}
        </span>
        <span className="text-md">
          {day.scheduledAt && <p>{formatDate(day.scheduledAt, 'd')}</p>}
        </span>
      </button>
      {!day.isRestDay && (
        <div className="relative h-1 my-1 mx-auto w-[66%] bg-secondary rounded-full">
          <div
            className={cn(
              'absolute inset-0',
              'h-1 rounded-full transition-all',
              isDayCompleted && 'bg-green-500',
              !day.completedAt && 'bg-amber-500',
              completionRate > 0 && completionRate < 1 && `bg-green-500`,
            )}
            style={{
              width:
                completionRate > 0 && completionRate < 1
                  ? `${completionRate * 100}%`
                  : undefined,
            }}
          />
        </div>
      )}
    </div>
  )
}

function DaySelector({ plan }: { plan: NavigationPlan }) {
  const { preferences } = useUserPreferences()
  const [activeWeekId] = useQueryState('week')
  const [activeDayId] = useQueryState('day')

  // Get default selection
  const { weekId: defaultWeekId } = useMemo(
    () => getDefaultSelection(plan),
    [plan],
  )

  const effectiveWeekId = activeWeekId || defaultWeekId

  // Find the active week from the plan
  const activeWeek = useMemo(() => {
    return plan.weeks.find((week) => week.id === effectiveWeekId)
  }, [plan.weeks, effectiveWeekId])

  if (!activeWeek) return null

  // Sort days according to user's week start preference
  const sortedDays = sortDaysForDisplay(
    activeWeek.days,
    preferences.weekStartsOn,
  )

  return (
    <div className="flex gap-[4px] w-full justify-between mt-2">
      {sortedDays.map((day) => (
        <Day key={day.id} day={day} isSelected={activeDayId === day.id} />
      ))}
    </div>
  )
}

function WeekSelector({ plan }: { plan: NavigationPlan }) {
  const { weekId: defaultWeekId, dayId: defaultDayId } = useMemo(
    () => getDefaultSelection(plan),
    [plan],
  )

  const [activeWeekId, setActiveWeekId] = useQueryState('week')
  const [activeDayId, setActiveDayId] = useQueryState('day')

  // Set defaults if no values are present in URL
  const effectiveWeekId = activeWeekId || defaultWeekId
  const effectiveDayId = activeDayId || defaultDayId

  // Prefetch workout data with 10s delay for better performance
  useWorkoutPrefetch(plan, effectiveWeekId)

  // Initialize defaults on first load
  useEffect(() => {
    if (!activeWeekId && defaultWeekId) {
      setActiveWeekId(defaultWeekId)
    }
    if (!activeDayId && defaultDayId) {
      setActiveDayId(defaultDayId)
    }
  }, [
    activeWeekId,
    activeDayId,
    defaultWeekId,
    defaultDayId,
    setActiveWeekId,
    setActiveDayId,
  ])

  const weeks = plan.weeks
  const activeWeek = weeks.find((week) => week.id === effectiveWeekId)

  const handleWeekDaySelect = (weekId: string, dayId: string) => {
    setActiveWeekId(weekId)
    setActiveDayId(dayId)
  }

  if (!activeWeek) return null

  return (
    <div className="flex justify-between">
      <CalendarWeekSelector
        plan={plan}
        activeWeekId={effectiveWeekId}
        activeDayId={effectiveDayId}
        onWeekDaySelect={handleWeekDaySelect}
      />
      {/* Add Select for Quick Workout and Preassigned plan if available */}
    </div>
  )
}
