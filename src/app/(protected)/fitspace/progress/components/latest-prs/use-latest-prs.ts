import { addDays, format, startOfWeek } from 'date-fns'

import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { useGetUserPrHistoryQuery } from '@/generated/graphql-client'

export function useLatestPRs() {
  const { user } = useUser()
  const { preferences } = useUserPreferences()

  const { data, isLoading, error } = useGetUserPrHistoryQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id },
  )

  // Sort PRs by date (most recent first)
  const sortedPRs =
    data?.getUserPRHistory?.sort(
      (a, b) =>
        new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
    ) || []

  // Get recent PRs (last 3)
  const recentPRs = sortedPRs.slice(0, 3)

  // Group PRs by week
  const weeklyPRs = sortedPRs.reduce(
    (acc, pr) => {
      const date = new Date(pr.achievedAt)
      const weekStart = startOfWeek(date, {
        weekStartsOn: preferences.weekStartsOn,
      })
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!acc[weekKey]) {
        acc[weekKey] = []
      }
      acc[weekKey].push(pr)
      return acc
    },
    {} as Record<string, typeof sortedPRs>,
  )

  // Helper function to format week range from week start date
  const formatWeekRangeFromStart = (weekStartDate: string) => {
    const startDate = new Date(weekStartDate)
    const weekEnd = addDays(startDate, 6) // Add 6 days to get the end of the week

    const startDay = format(startDate, 'd')
    const endDay = format(weekEnd, 'd')
    const startMonth = format(startDate, 'MMM')
    const endMonth = format(weekEnd, 'MMM')

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`
    }

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
  }

  return {
    recentPRs,
    weeklyPRs: Object.entries(weeklyPRs).map(([weekKey, prs]) => ({
      week: formatWeekRangeFromStart(weekKey),
      prs,
    })),
    isLoading,
    error,
  }
}
