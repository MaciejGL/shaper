import { endOfWeek, format, isSameDay, startOfWeek } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

/**
 * UTC date utilities for consistent date handling across client and server
 * Uses date-fns-tz for clean timezone handling
 */

/**
 * Convert a date string (YYYY-MM-DD) to UTC midnight
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at UTC midnight
 */
export function parseUTCDate(dateString: string): Date {
  return fromZonedTime(dateString + 'T00:00:00', 'UTC')
}

/**
 * Convert any date to UTC midnight
 * @param date - Date object or date string
 * @returns Date object at UTC midnight
 */
export function toUTCMidnight(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date
  const utcDate = toZonedTime(d, 'UTC')
  return fromZonedTime(format(utcDate, 'yyyy-MM-dd') + 'T00:00:00', 'UTC')
}

/**
 * Get the current date as UTC midnight
 * @returns Date object representing today at UTC midnight
 */
export function getTodayUTC(): Date {
  return toUTCMidnight(new Date())
}

/**
 * Get start of week in UTC for a given date
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param weekStartsOn - 0 for Sunday, 1 for Monday (default: 1)
 * @returns Start of week at UTC midnight
 */
export function getStartOfWeekUTC(
  date: string | Date,
  weekStartsOn: 0 | 1 = 1,
): Date {
  const utcDate =
    typeof date === 'string' ? parseUTCDate(date) : toUTCMidnight(date)
  return startOfWeek(utcDate, { weekStartsOn })
}

/**
 * Get end of week in UTC for a given date
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param weekStartsOn - 0 for Sunday, 1 for Monday (default: 1)
 * @returns End of week at UTC
 */
export function getEndOfWeekUTC(
  date: string | Date,
  weekStartsOn: 0 | 1 = 1,
): Date {
  const utcDate =
    typeof date === 'string' ? parseUTCDate(date) : toUTCMidnight(date)
  return endOfWeek(utcDate, { weekStartsOn })
}

/**
 * Get week boundaries for date filtering in queries
 * @param date - Date string (YYYY-MM-DD) or Date object
 * @param weekStartsOn - 0 for Sunday, 1 for Monday (default: 1)
 * @returns Object with gte/lte dates for Prisma queries
 */
export function getWeekBoundariesUTC(
  date: string | Date,
  weekStartsOn: 0 | 1 = 1,
) {
  return {
    gte: getStartOfWeekUTC(date, weekStartsOn),
    lte: getEndOfWeekUTC(date, weekStartsOn),
  }
}

/**
 * Convert date to YYYY-MM-DD format in UTC
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatUTCDate(date: Date): string {
  return format(toZonedTime(date, 'UTC'), 'yyyy-MM-dd')
}

/**
 * Convert date to ISO string (for GraphQL queries)
 * @param date - Date object
 * @returns ISO string
 */
export function toISOString(date: Date): string {
  return date.toISOString()
}

/**
 * Check if two dates are the same day in UTC
 * @param date1 - First date (string or Date)
 * @param date2 - Second date (string or Date)
 * @returns Boolean indicating if they're the same day
 */
export function isSameDayUTC(
  date1: string | Date,
  date2: string | Date,
): boolean {
  const utc1 =
    typeof date1 === 'string' ? parseUTCDate(date1) : toUTCMidnight(date1)
  const utc2 =
    typeof date2 === 'string' ? parseUTCDate(date2) : toUTCMidnight(date2)
  return isSameDay(utc1, utc2)
}

/**
 * Compare two dates in UTC (for week start comparisons)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareWeeksUTC(
  date1: string | Date,
  date2: string | Date,
): number {
  const week1 = getStartOfWeekUTC(date1)
  const week2 = getStartOfWeekUTC(date2)

  if (week1 < week2) return -1
  if (week1 > week2) return 1
  return 0
}

/**
 * Create a timestamp with specific date but current time in local timezone
 * Useful for meal logging where we want to preserve the date being viewed
 * but record the actual local time when the food was logged
 * @param dateString - Date string in YYYY-MM-DD format (the date being viewed)
 * @returns ISO string with the viewed date but current local time
 */
export function createTimestampWithDateAndCurrentTime(
  dateString?: string | null,
): string {
  if (!dateString) return new Date().toISOString()

  // Get current time in local timezone
  const now = new Date()

  // Parse the viewed date and combine with current local time
  // This creates a date in the user's local timezone, preserving the actual time context
  const combinedDate = new Date(
    parseInt(dateString.split('-')[0]), // year
    parseInt(dateString.split('-')[1]) - 1, // month (0-indexed)
    parseInt(dateString.split('-')[2]), // day
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  )

  return combinedDate.toISOString()
}
