import { addWeeks, format, startOfWeek } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export function formatDateKey(date: Date, timezone: string): string {
  return format(toZonedTime(date, timezone), 'yyyy-MM-dd')
}

export function getDateKeyAsUTC(dateKey: string, timezone: string): Date {
  return fromZonedTime(dateKey + 'T00:00:00', timezone)
}

export function formatWeekRange(date: Date, weekStartsOn: 0 | 1): string {
  const weekStart = startOfWeek(date, { weekStartsOn })
  const weekEnd = addWeeks(weekStart, 1)
  weekEnd.setDate(weekEnd.getDate() - 1)
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
}
