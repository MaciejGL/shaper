'use client'

import { formatDate } from 'date-fns'
import { BadgeCheckIcon, ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserPreferences } from '@/context/user-preferences-context'
import { formatWeekRange, sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

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
  const [, setActiveExerciseId] = useQueryState('exercise')

  const handleClick = () => {
    setActiveExerciseId(day.exercises.at(0)?.id ?? '')
    setActiveDayId(day.id)
  }

  const isDayCompleted = day.completedAt
  const completionRate =
    day.exercises.filter((exercise) => exercise.completedAt).length /
    day.exercises.length

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

// Helper function to determine default week and day selection
function getDefaultSelection(plan: NavigationPlan) {
  if (!plan.weeks.length) return { weekId: null, dayId: null }

  // Try to find the current week based on start date and schedule
  const now = new Date()
  const planStartDate = plan.startDate ? new Date(plan.startDate) : now

  // Calculate which week we should be in based on plan start date
  const daysSinceStart = Math.floor(
    (now.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  const expectedWeekIndex = Math.max(0, Math.floor(daysSinceStart / 7))

  // Find the appropriate week
  let defaultWeek =
    plan.weeks[Math.min(expectedWeekIndex, plan.weeks.length - 1)]

  // If we calculated beyond available weeks, use the last week
  if (!defaultWeek) {
    defaultWeek = plan.weeks[plan.weeks.length - 1]
  }

  // Find the appropriate day in that week
  // Convert JavaScript day to training system format
  // JavaScript: 0=Sunday, 1=Monday, ..., 6=Saturday
  // Training system: 0=Monday, 1=Tuesday, ..., 6=Sunday
  const jsDay = now.getDay()
  const trainingDay = jsDay === 0 ? 6 : jsDay - 1
  let defaultDay = defaultWeek.days.find((day) => day.dayOfWeek === trainingDay)

  // If no matching day, find the first non-completed day, or first day
  if (!defaultDay) {
    defaultDay =
      defaultWeek.days.find((day) => !day.completedAt) || defaultWeek.days[0]
  }

  return {
    weekId: defaultWeek.id,
    dayId: defaultDay?.id || null,
  }
}

function WeekSelector({ plan }: { plan: NavigationPlan }) {
  const { preferences } = useUserPreferences()
  const { weekId: defaultWeekId, dayId: defaultDayId } = useMemo(
    () => getDefaultSelection(plan),
    [plan],
  )

  const [activeWeekId, setActiveWeekId] = useQueryState('week')
  const [activeDayId, setActiveDayId] = useQueryState('day')

  // Set defaults if no values are present in URL
  const effectiveWeekId = activeWeekId || defaultWeekId
  const effectiveDayId = activeDayId || defaultDayId

  // Initialize defaults on first load
  useMemo(() => {
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

  const handleWeekChange = (type: 'prev' | 'next') => {
    const currentWeekIndex = weeks.findIndex(
      (week) => week.id === effectiveWeekId,
    )
    const currentActiveDayOfWeek =
      activeWeek?.days.find((day) => day.id === effectiveDayId)?.dayOfWeek ?? 0

    if (type === 'prev' && currentWeekIndex > 0) {
      const newWeek = weeks[currentWeekIndex - 1]
      const newDay =
        newWeek.days.find((day) => day.dayOfWeek === currentActiveDayOfWeek) ||
        newWeek.days[0]
      setActiveWeekId(newWeek.id)
      setActiveDayId(newDay.id)
    } else if (type === 'next' && currentWeekIndex < weeks.length - 1) {
      const newWeek = weeks[currentWeekIndex + 1]
      const newDay =
        newWeek.days.find((day) => day.dayOfWeek === currentActiveDayOfWeek) ||
        newWeek.days[0]
      setActiveWeekId(newWeek.id)
      setActiveDayId(newDay.id)
    }
  }

  const currentWeekIndex = weeks.findIndex(
    (week) => week.id === effectiveWeekId,
  )
  const hasPrevWeek = currentWeekIndex > 0
  const hasNextWeek = currentWeekIndex < weeks.length - 1

  const handleWeekSelect = (weekId: string) => {
    const newWeek = weeks.find((week) => week.id === weekId)
    if (!newWeek) return

    setActiveWeekId(weekId)
    // When changing weeks, try to keep the same day of week, or pick first day
    const currentActiveDayOfWeek =
      activeWeek?.days.find((day) => day.id === effectiveDayId)?.dayOfWeek ?? 0
    const newDay =
      newWeek.days.find((day) => day.dayOfWeek === currentActiveDayOfWeek) ||
      newWeek.days[0]
    setActiveDayId(newDay.id)
  }

  if (!activeWeek) return null

  return (
    <div className="flex justify-between gap-2">
      <Button
        iconOnly={<ChevronLeft />}
        disabled={!hasPrevWeek}
        size="icon-sm"
        variant="tertiary"
        onClick={() => handleWeekChange('prev')}
      />
      <Select
        onValueChange={handleWeekSelect}
        value={effectiveWeekId ?? undefined}
      >
        <SelectTrigger
          size="sm"
          variant="tertiary"
          className="[&_svg]:data-[icon=mark]:size-3.5 truncate text-sm font-medium flex items-center gap-2 w-full"
        >
          <SelectValue placeholder="Select a workout" />
        </SelectTrigger>
        <SelectContent>
          {weeks.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              Week {week.weekNumber}{' '}
              {week.completedAt ? (
                <BadgeCheckIcon
                  data-icon="mark"
                  className="text-green-500 size-3"
                />
              ) : (
                week.scheduledAt && (
                  <span className="text-muted-foreground text-xs ml-2">
                    {formatWeekRange(
                      week.scheduledAt,
                      preferences.weekStartsOn,
                    )}
                  </span>
                )
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        iconOnly={<ChevronRight />}
        size="icon-sm"
        variant="tertiary"
        onClick={() => handleWeekChange('next')}
        disabled={!hasNextWeek}
      />
    </div>
  )
}
