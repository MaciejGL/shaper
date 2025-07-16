import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

export interface UserDatePreferences {
  weekStartsOn?: number | null
}

/**
 * Server-side date utilities that respect user preferences
 * All calculations are done in UTC for consistency across timezones
 * Timezone is passed from client, weekStartsOn comes from user preferences
 */

/**
 * Convert a date string (YYYY-MM-DD) to UTC midnight
 * Respects user's timezone for determining "midnight"
 */
export function parseUTCDate(
  dateString: string,
  timezone: string = 'UTC',
): Date {
  // If user has a specific timezone, interpret the date in that timezone
  // then convert to UTC
  if (timezone !== 'UTC') {
    return fromZonedTime(dateString + 'T00:00:00', timezone)
  }
  return fromZonedTime(dateString + 'T00:00:00', 'UTC')
}

/**
 * Get the current date in user's timezone, but return as UTC midnight
 */
export function getTodayUTC(timezone: string = 'UTC'): Date {
  const now = new Date()
  const userLocalDate = toZonedTime(now, timezone)
  const dateString = format(userLocalDate, 'yyyy-MM-dd')
  return parseUTCDate(dateString, timezone)
}

/**
 * Get week start for a given date, respecting user's week start preference
 * Returns UTC date
 */
export function getWeekStartUTC(
  date: Date | string,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): Date {
  const targetDate =
    typeof date === 'string' ? parseUTCDate(date, timezone) : date

  // Convert to user's timezone to determine the correct week boundaries
  const userLocalDate = toZonedTime(targetDate, timezone)
  const weekStart = startOfWeek(userLocalDate, { weekStartsOn })

  // Convert back to UTC midnight
  const dateString = format(weekStart, 'yyyy-MM-dd')
  return parseUTCDate(dateString, timezone)
}

/**
 * Get week end for a given date, respecting user's week start preference
 * Returns UTC date
 */
export function getWeekEndUTC(
  date: Date | string,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): Date {
  const targetDate =
    typeof date === 'string' ? parseUTCDate(date, timezone) : date

  // Convert to user's timezone to determine the correct week boundaries
  const userLocalDate = toZonedTime(targetDate, timezone)
  const weekEnd = endOfWeek(userLocalDate, { weekStartsOn })

  // Convert back to UTC midnight
  const dateString = format(weekEnd, 'yyyy-MM-dd')
  return parseUTCDate(dateString, timezone)
}

/**
 * Get week boundaries for queries
 */
export function getWeekBoundariesUTC(
  date: Date | string,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): { gte: Date; lte: Date } {
  return {
    gte: getWeekStartUTC(date, timezone, weekStartsOn),
    lte: getWeekEndUTC(date, timezone, weekStartsOn),
  }
}

/**
 * Calculate scheduled date for a day within a week
 * Used for training plan scheduling
 */
export function calculateDayScheduleUTC(
  weekStartDate: Date,
  dayOfWeek: number,
): Date {
  // dayOfWeek should be 0-6 where 0 represents the first day of user's week
  return addDays(weekStartDate, dayOfWeek)
}

/**
 * Calculate week schedule for training plans
 */
export function calculateWeekScheduleUTC(
  planStartDate: Date,
  weekIndex: number,
): Date {
  return addWeeks(planStartDate, weekIndex)
}

/**
 * Format date for API responses (ISO string)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString()
}

/**
 * Format date for database storage (Date object in UTC)
 */
export function formatDateForDB(date: Date): Date {
  return date
}

/**
 * Compare weeks in UTC (useful for meal plan comparisons)
 */
export function compareWeeksUTC(
  date1: string | Date,
  date2: string | Date,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): number {
  const week1Start = getWeekStartUTC(date1, timezone, weekStartsOn)
  const week2Start = getWeekStartUTC(date2, timezone, weekStartsOn)
  return differenceInCalendarDays(week1Start, week2Start)
}

/**
 * Check if a date falls within a specific day of the week in user's timezone
 */
export function isDayMatch(
  selectedDate: string | Date,
  targetDayOfWeek: number,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): boolean {
  const weekStart = getWeekStartUTC(selectedDate, timezone, weekStartsOn)
  const targetDate = calculateDayScheduleUTC(weekStart, targetDayOfWeek)

  const selectedUTC =
    typeof selectedDate === 'string'
      ? parseUTCDate(selectedDate, timezone)
      : selectedDate

  return Math.abs(differenceInCalendarDays(selectedUTC, targetDate)) < 1
}

/**
 * Get the day of week index for a date in user's timezone
 * Returns 0-6 where 0 is the user's week start day
 */
export function getDayOfWeekIndex(
  date: Date | string,
  timezone: string = 'UTC',
  weekStartsOn: 0 | 1 = 1,
): number {
  const targetDate =
    typeof date === 'string' ? parseUTCDate(date, timezone) : date
  const userLocalDate = toZonedTime(targetDate, timezone)
  const jsDay = userLocalDate.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Normalize to user's week start preference
  return weekStartsOn === 1
    ? (jsDay + 6) % 7 // Monday = 0
    : jsDay // Sunday = 0
}

/**
 * Create a date utilities object with user preferences and timezone pre-applied
 * Usage in GraphQL resolvers:
 *
 * const dateUtils = createDateUtils({
 *   timezone: 'America/New_York', // from client
 *   weekStartsOn: user.profile?.weekStartsOn
 * })
 *
 * dateUtils.parseUTCDate('2024-01-15')
 * dateUtils.getWeekStartUTC(new Date())
 */
export function createDateUtils(
  options: { timezone?: string; weekStartsOn?: number | null } = {},
) {
  const timezone = options.timezone || 'UTC'
  const weekStartsOn = (options.weekStartsOn ?? 1) as 0 | 1

  return {
    parseUTCDate: (dateString: string) => parseUTCDate(dateString, timezone),
    getTodayUTC: () => getTodayUTC(timezone),
    getWeekStartUTC: (date: Date | string) =>
      getWeekStartUTC(date, timezone, weekStartsOn),
    getWeekEndUTC: (date: Date | string) =>
      getWeekEndUTC(date, timezone, weekStartsOn),
    getWeekBoundariesUTC: (date: Date | string) =>
      getWeekBoundariesUTC(date, timezone, weekStartsOn),
    calculateDayScheduleUTC,
    calculateWeekScheduleUTC,
    formatDateForAPI,
    formatDateForDB,
    compareWeeksUTC: (date1: string | Date, date2: string | Date) =>
      compareWeeksUTC(date1, date2, timezone, weekStartsOn),
    isDayMatch: (selectedDate: string | Date, targetDayOfWeek: number) =>
      isDayMatch(selectedDate, targetDayOfWeek, timezone, weekStartsOn),
    getDayOfWeekIndex: (date: Date | string) =>
      getDayOfWeekIndex(date, timezone, weekStartsOn),
  }
}

/**
 * Default date utils for when user preferences are not available
 */
export const defaultDateUtils = createDateUtils()
