import { QuickWorkoutPlan } from '../../../types'

/**
 * Formats a week title with date range
 */
export function formatWeekTitle(week: {
  weekNumber: number
  scheduledAt?: string | null
}) {
  if (!week.scheduledAt) return `Week ${week.weekNumber}`

  const startDate = new Date(week.scheduledAt)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        startDate.getFullYear() !== new Date().getFullYear()
          ? 'numeric'
          : undefined,
    })

  return `Week ${week.weekNumber} • ${formatDate(startDate)} - ${formatDate(endDate)}`
}

/**
 * Filters and sorts weeks that have completed workouts
 */
export function getWeeksWithCompletedWorkouts(
  plan: QuickWorkoutPlan | null | undefined,
) {
  return (
    plan?.weeks
      ?.filter((week) =>
        week.days.some((day) => day.completedAt && day.exercises.length > 0),
      )
      .sort((a, b) => {
        // Sort by scheduledAt date, most recent first
        const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0
        const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0
        return dateB - dateA
      }) || []
  )
}

/**
 * Gets completed workouts for a week, sorted by completion date
 */
export function getCompletedWorkoutsForWeek(
  week: NonNullable<QuickWorkoutPlan>['weeks'][number],
) {
  return (
    week?.days
      .filter((day) => day.completedAt && day.exercises.length > 0)
      .sort(
        (a, b) =>
          new Date(a.completedAt!).getTime() -
          new Date(b.completedAt!).getTime(),
      ) || []
  )
}
