'use client'

import { CalendarIcon, CheckCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn } from '@/lib/utils'

import { NavigationPlan } from './workout-day'

interface CalendarWeekSelectorProps {
  plan: NavigationPlan
  activeWeekId: string | null
  activeDayId: string | null
  onWeekDaySelect: (weekId: string, dayId: string) => void
}

// Helper to format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarWeekSelector({
  plan,
  activeWeekId,
  activeDayId,
  onWeekDaySelect,
}: CalendarWeekSelectorProps) {
  const [open, setOpen] = useState(false)
  const { preferences } = useUserPreferences()

  const activeWeek = plan.weeks.find((week) => week.id === activeWeekId)
  const activeDay = activeWeek?.days.find((day) => day.id === activeDayId)

  // Build a map of dates to day data for the calendar
  const dayStatusMap = useMemo(() => {
    const map = new Map<
      string,
      {
        dayId: string
        weekId: string
        isRestDay: boolean
        completedAt: string | null | undefined
        scheduledAt: string | null | undefined
        exercisesCount: number
      }
    >()

    plan.weeks.forEach((week) => {
      if (!week.scheduledAt) return

      const weekStart = new Date(week.scheduledAt)

      week.days.forEach((day) => {
        // Calculate the date for this day
        const dayDate = new Date(weekStart)
        // dayOfWeek: 0=Monday, 1=Tuesday, ..., 6=Sunday
        dayDate.setDate(weekStart.getDate() + day.dayOfWeek)

        const dateKey = formatDateKey(dayDate)

        map.set(dateKey, {
          dayId: day.id,
          weekId: week.id,
          isRestDay: day.isRestDay,
          completedAt: day.completedAt,
          scheduledAt: day.scheduledAt,
          exercisesCount: day.exercisesCount,
        })
      })
    })

    return map
  }, [plan.weeks])

  // Get dates categorized by status
  const { completedDates, pendingDates, restDayDates, emptyDates } =
    useMemo(() => {
      const completed: Date[] = []
      const pending: Date[] = []
      const restDays: Date[] = []
      const empty: Date[] = []

      dayStatusMap.forEach((dayData, dateStr) => {
        const date = new Date(dateStr)
        if (dayData.completedAt) {
          completed.push(date)
        } else if (dayData.isRestDay) {
          restDays.push(date)
        } else if (dayData.exercisesCount === 0) {
          empty.push(date)
        } else {
          pending.push(date)
        }
      })

      return {
        completedDates: completed,
        pendingDates: pending,
        restDayDates: restDays,
        emptyDates: empty,
      }
    }, [dayStatusMap])

  // Currently selected date in calendar
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!activeWeek?.scheduledAt || !activeDay) return undefined
    const weekStart = new Date(activeWeek.scheduledAt)
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + activeDay.dayOfWeek)
    return dayDate
  })

  // When drawer opens, sync selected date
  useEffect(() => {
    if (open && activeWeek?.scheduledAt && activeDay) {
      const weekStart = new Date(activeWeek.scheduledAt)
      const dayDate = new Date(weekStart)
      dayDate.setDate(weekStart.getDate() + activeDay.dayOfWeek)
      setSelectedDate(dayDate)
    }
  }, [open, activeWeek, activeDay])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const dateKey = formatDateKey(date)
    const dayData = dayStatusMap.get(dateKey)

    if (dayData) {
      onWeekDaySelect(dayData.weekId, dayData.dayId)
      setSelectedDate(date)
      setOpen(false)
    }
  }

  const formatWeekDisplay = () => {
    if (!activeWeek || !activeDay) return 'Select Week'

    const weekLabel = `Week ${activeWeek.weekNumber}`

    if (activeWeek.scheduledAt) {
      const weekStart = new Date(activeWeek.scheduledAt)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }

      return (
        <span className="flex items-center gap-1.5 text-sm">
          {weekLabel}
          <span className="text-muted-foreground text-xs">
            {formatDate(weekStart)} - {formatDate(weekEnd)}{' '}
          </span>
        </span>
      )
    }

    return weekLabel
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="top">
      <DrawerTrigger asChild>
        <Button
          variant="tertiary"
          size="md"
          onClick={() => setOpen(true)}
          iconStart={<CalendarIcon />}
          iconEnd={
            activeWeek?.completedAt ? (
              <CheckCircle className="text-green-500 size-3.5" />
            ) : null
          }
        >
          {formatWeekDisplay()}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        dialogTitle="Select Week & Day"
        className="h-max data-[vaul-drawer-direction=top]:border-b-0 overflow-hidden "
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const dateKey = formatDateKey(date)
            return !dayStatusMap.has(dateKey)
          }}
          weekStartsOn={preferences.weekStartsOn}
          captionLayout="label"
          modifiers={{
            completed: completedDates,
            pending: pendingDates,
            restDay: restDayDates,
            empty: emptyDates,
            today: new Date(),
          }}
          modifiersClassNames={{
            completed:
              'bg-green-300 dark:bg-green-700 font-semibold hover:bg-green-500 rounded-xl',
            pending:
              'bg-amber-200 dark:bg-amber-500/50 font-medium hover:bg-yellow-400 rounded-xl',
            restDay: cn('rounded-xl opacity-75 bg-card-on-card'),
            empty: 'rounded-xl bg-card-on-card',
            today: cn('outline-primary outline-offset-1 outline-2 rounded-xl'),
            outside: 'opacity-50',
          }}
          className="w-full aspect-square max-w-sm mx-auto [&_button]:rounded-xl! **:font-medium [&_[data-selected=true]_button]:bg-primary bg-transparent"
        />
      </DrawerContent>
    </Drawer>
  )
}
