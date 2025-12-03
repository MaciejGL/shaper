import {
  addDays,
  endOfWeek,
  format,
  getDay,
  isThisWeek,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns'

import { useUser } from '@/context/user-context'
import { useActivityHeatmapQuery } from '@/generated/graphql-client'

export interface DayCell {
  date: string
  totalSets: number
  dayOfWeek: number
  weekIndex: number
  dayLabel: string
}

export interface WeekColumn {
  weekIndex: number
  weekStartDate: string
  weekEndDate: string
  days: DayCell[]
  isCurrentWeek: boolean
}

export interface WeekStats {
  totalSets: number
  activeDays: number
  weekLabel: string
  days: DayCell[]
}

export const ACTIVITY_WEEK_COUNT = 8
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface UseActivityHeatmapProps {
  weekOffset: number
  onWeekOffsetChange: (offset: number) => void
}

export function useActivityHeatmap({ weekOffset, onWeekOffsetChange }: UseActivityHeatmapProps) {
  const { user } = useUser()
  const weekStartsOn = (user?.profile?.weekStartsOn ?? 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6
  
  // Convert weekOffset (0=current, 1=last week) to selectedWeekIndex (7=current, 6=last week)
  const selectedWeekIndex = Math.max(0, Math.min(ACTIVITY_WEEK_COUNT - 1, ACTIVITY_WEEK_COUNT - 1 - weekOffset))
  const setSelectedWeekIndex = (index: number) => {
    onWeekOffsetChange(ACTIVITY_WEEK_COUNT - 1 - index)
  }

  const { data, isLoading, error } = useActivityHeatmapQuery(
    {
      userId: user?.id || '',
      weekCount: ACTIVITY_WEEK_COUNT,
    },
    { enabled: !!user?.id },
  )

  const activityMap = new Map<string, number>()
  data?.activityHeatmap.activities.forEach((activity) => {
    activityMap.set(activity.date, activity.totalSets)
  })

  const now = new Date()
  const weeks: WeekColumn[] = []

  const orderedDayIndices = Array.from(
    { length: 7 },
    (_, i) => (weekStartsOn + i) % 7,
  )

  for (let weekIdx = ACTIVITY_WEEK_COUNT - 1; weekIdx >= 0; weekIdx--) {
    const targetWeek = subWeeks(now, weekIdx)
    const weekStart = startOfWeek(targetWeek, { weekStartsOn })
    const weekEnd = endOfWeek(targetWeek, { weekStartsOn })

    const days: DayCell[] = []

    orderedDayIndices.forEach((dayOfWeekValue, rowIndex) => {
      const dayDate = addDays(weekStart, rowIndex)
      const dateKey = format(dayDate, 'yyyy-MM-dd')
      days.push({
        date: dateKey,
        totalSets: activityMap.get(dateKey) || 0,
        dayOfWeek: dayOfWeekValue,
        weekIndex: ACTIVITY_WEEK_COUNT - 1 - weekIdx,
        dayLabel: DAY_NAMES[dayOfWeekValue],
      })
    })

    weeks.push({
      weekIndex: ACTIVITY_WEEK_COUNT - 1 - weekIdx,
      weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
      days,
      isCurrentWeek: isThisWeek(weekStart, { weekStartsOn }),
    })
  }

  const maxSets = Math.max(
    1,
    ...data?.activityHeatmap.activities.map((a) => a.totalSets) || [1],
  )

  const selectedWeek = weeks.find((w) => w.weekIndex === selectedWeekIndex)
  const selectedWeekStats: WeekStats | null = selectedWeek
    ? {
        totalSets: selectedWeek.days.reduce((sum, d) => sum + d.totalSets, 0),
        activeDays: selectedWeek.days.filter((d) => d.totalSets > 0).length,
        weekLabel: `${format(parseISO(selectedWeek.weekStartDate), 'MMM d')} - ${format(parseISO(selectedWeek.weekEndDate), 'MMM d')}`,
        days: selectedWeek.days,
      }
    : null

  const orderedDayLabels = orderedDayIndices.map((i) => DAY_NAMES[i])

  return {
    weeks,
    maxSets,
    selectedWeekIndex,
    setSelectedWeekIndex,
    selectedWeekStats,
    weekCount: ACTIVITY_WEEK_COUNT,
    weekStartsOn,
    orderedDayLabels,
    isLoading,
    error,
  }
}
