import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  formatDistanceToNow,
  parseISO,
  startOfWeek,
  subDays,
} from 'date-fns'

import { getWeekStartUTC } from './server-date-utils'

export type WeekStartDay = 0 | 1 // 0 = Sunday, 1 = Monday

// User preference - this could come from user settings/context in the future
export const DEFAULT_WEEK_START: WeekStartDay = 1 // Monday

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Convert JavaScript's getDay() to a standardized day number based on week start preference
 * @param jsDay - JavaScript's getDay() result (0=Sunday, 1=Monday, etc.)
 * @param weekStartsOn - 0 for Sunday start, 1 for Monday start
 * @returns Normalized day number where 0 is the first day of the week
 */
export function normalizeDay(
  jsDay: number,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): number {
  if (weekStartsOn === 1) {
    // Monday start: Monday=0, Tuesday=1, ..., Sunday=6
    return (jsDay + 6) % 7
  } else {
    // Sunday start: Sunday=0, Monday=1, ..., Saturday=6
    return jsDay
  }
}

/**
 * Convert normalized day number back to JavaScript's getDay() format
 * @param normalizedDay - Normalized day (0 is first day of week)
 * @param weekStartsOn - 0 for Sunday start, 1 for Monday start
 * @returns JavaScript's getDay() equivalent
 */
export function denormalizeDay(
  normalizedDay: number,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): number {
  if (weekStartsOn === 1) {
    // Convert Monday=0 back to Monday=1
    return (normalizedDay + 1) % 7
  } else {
    // Already in JavaScript format
    return normalizedDay
  }
}

/**
 * Get the day of week for a date string, normalized to user preference
 * @param dateString - ISO date string
 * @param weekStartsOn - Week start preference
 * @returns Normalized day number
 */
export function getDayOfWeek(
  dateString: string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): number {
  const date = parseISO(dateString)
  return normalizeDay(date.getDay(), weekStartsOn)
}

/**
 * Generate week days array starting from the given date
 * @param dateString - ISO date string
 * @param weekStartsOn - Week start preference
 * @returns Array of ISO date strings for the week
 */
export function getWeekDays(
  dateString: string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): string[] {
  const selectedDate = parseISO(dateString)
  const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn })

  return Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = addDays(startOfWeekDate, i)
    return format(dayOfWeek, 'yyyy-MM-dd')
  })
}

/**
 * Get the Sunday from the previous week
 * @param dateString - ISO date string
 * @param weekStartsOn - Week start preference
 * @returns ISO date string for previous week's Sunday
 */
export function getPreviousWeekSunday(
  dateString: string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): string {
  const selectedDate = parseISO(dateString)
  const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn })

  // Go back to previous week's Sunday
  const previousWeekStart = subDays(startOfWeekDate, 7)
  const previousWeekSunday =
    weekStartsOn === 1
      ? addDays(previousWeekStart, 6) // If week starts on Monday, Sunday is at index 6
      : previousWeekStart // If week starts on Sunday, Sunday is at index 0

  return format(previousWeekSunday, 'yyyy-MM-dd')
}

/**
 * Get the Monday from the next week
 * @param dateString - ISO date string
 * @param weekStartsOn - Week start preference
 * @returns ISO date string for next week's Monday
 */
export function getNextWeekMonday(
  dateString: string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): string {
  const selectedDate = parseISO(dateString)
  const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn })

  // Go to next week's Monday
  const nextWeekStart = addDays(startOfWeekDate, 7)
  const nextWeekMonday =
    weekStartsOn === 1
      ? nextWeekStart // If week starts on Monday, Monday is at index 0
      : addDays(nextWeekStart, 1) // If week starts on Sunday, Monday is at index 1

  return format(nextWeekMonday, 'yyyy-MM-dd')
}

/**
 * Generate extended week days array that includes adjacent week days for seamless navigation
 * @param dateString - ISO date string
 * @param weekStartsOn - Week start preference
 * @returns Array of ISO date strings including current week + previous Sunday + next Monday
 */
export function getExtendedWeekDays(
  dateString: string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): string[] {
  const currentWeekDays = getWeekDays(dateString, weekStartsOn)
  const previousSunday = getPreviousWeekSunday(dateString, weekStartsOn)
  const nextMonday = getNextWeekMonday(dateString, weekStartsOn)

  // Return array with previous Sunday at start and next Monday at end
  return [previousSunday, ...currentWeekDays, nextMonday]
}

/**
 * Check if a given day matches the selected date's day of week
 * @param selectedDateString - Selected date ISO string
 * @param targetDayOfWeek - Target day of week (in database format)
 * @param weekStartsOn - Week start preference
 * @returns Boolean indicating if they match
 */
export function isDayMatch(
  selectedDateString: string,
  targetDayOfWeek: number,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): boolean {
  const selectedDayOfWeek = getDayOfWeek(selectedDateString, weekStartsOn)
  return selectedDayOfWeek === targetDayOfWeek
}

/**
 * Create date utilities factory with user preferences applied
 * Usage: const dateUtils = createDateUtils(userPreference)
 */
export function createDateUtils(
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
) {
  return {
    getDayOfWeek: (dateString: string) =>
      getDayOfWeek(dateString, weekStartsOn),
    getWeekDays: (dateString: string) => getWeekDays(dateString, weekStartsOn),
    getExtendedWeekDays: (dateString: string) =>
      getExtendedWeekDays(dateString, weekStartsOn),
    getPreviousWeekSunday: (dateString: string) =>
      getPreviousWeekSunday(dateString, weekStartsOn),
    getNextWeekMonday: (dateString: string) =>
      getNextWeekMonday(dateString, weekStartsOn),
    isDayMatch: (selectedDateString: string, targetDayOfWeek: number) =>
      isDayMatch(selectedDateString, targetDayOfWeek, weekStartsOn),
    normalizeDay: (jsDay: number) => normalizeDay(jsDay, weekStartsOn),
    denormalizeDay: (normalizedDay: number) =>
      denormalizeDay(normalizedDay, weekStartsOn),
  }
}

/**
 * Check if a date is in the current week based on user's week start preference
 * Replaces isThisISOWeek for preference-aware week checking
 */
export function isThisWeek(
  date: Date | string,
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  const currentWeekStart = startOfWeek(now, { weekStartsOn })
  const currentWeekEnd = endOfWeek(now, { weekStartsOn })

  return targetDate >= currentWeekStart && targetDate <= currentWeekEnd
}

/**
 * Calculates the correct scheduled date for a training day based on user's week start preference
 * Used when activating training plans to set the correct scheduledAt dates
 */
export function calculateTrainingDayScheduledDate(
  planStartDate: Date,
  weekIndex: number,
  dayOfWeek: number, // 0=Monday, 1=Tuesday, ..., 6=Sunday
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): Date {
  // Calculate the week start based on user preference
  const weekStart = getWeekStartUTC(
    addWeeks(planStartDate, weekIndex),
    'UTC',
    weekStartsOn,
  )

  if (weekStartsOn === 1) {
    // Monday-first: dayOfWeek maps directly (0=Monday, 1=Tuesday, ..., 6=Sunday)
    return addDays(weekStart, dayOfWeek)
  } else {
    // Sunday-first: adjust dayOfWeek mapping
    // dayOfWeek 0=Monday should become day 1 in Sunday-first week
    // dayOfWeek 6=Sunday should become day 0 in Sunday-first week
    const adjustedDayIndex = dayOfWeek === 6 ? 0 : dayOfWeek + 1
    return addDays(weekStart, adjustedDayIndex)
  }
}

/**
 * Sorts days array based on user's week start preference for display
 * Note: This doesn't change the dayOfWeek values, just the display order
 */
export function sortDaysForDisplay<T extends { dayOfWeek: number }>(
  days: T[],
  weekStartsOn: WeekStartDay = DEFAULT_WEEK_START,
): T[] {
  if (weekStartsOn === 1) {
    // Monday-first: Sort by dayOfWeek directly (0=Monday, 1=Tuesday, ..., 6=Sunday)
    return [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  } else {
    // Sunday-first: Sort with Sunday (dayOfWeek=6) first, then Monday-Saturday
    return [...days].sort((a, b) => {
      const aOrder = a.dayOfWeek === 6 ? 0 : a.dayOfWeek + 1 // Sunday=0, Monday=1, ..., Saturday=6
      const bOrder = b.dayOfWeek === 6 ? 0 : b.dayOfWeek + 1
      return aOrder - bOrder
    })
  }
}

/**
 * Translates a plan template's dayOfWeek value to match user's week start preference
 * Plan templates use Monday-based numbering (0=Monday), but users may prefer Sunday-first
 */
export function translateDayOfWeekForUser(
  templateDayOfWeek: number, // 0=Monday, 1=Tuesday, ..., 6=Sunday (template format)
  userWeekStartsOn: WeekStartDay,
): number {
  if (userWeekStartsOn === 1) {
    // User prefers Monday-first: no translation needed
    return templateDayOfWeek
  } else {
    // User prefers Sunday-first: shift template days backwards by 1
    // Template's day 0 (Monday/first day of program) becomes day 6 (Sunday/first day of user's week)
    // Template's day 1 (Tuesday/second day) becomes day 0 (Monday/second day of user's week)
    return (templateDayOfWeek + 6) % 7 // Shift backwards by 1 (equivalent to -1 but handles wrap-around)
  }
}

/**
 * Reverses the translation - converts user's dayOfWeek back to template format
 * Useful for when saving user-created plans
 */
export function translateDayOfWeekToTemplate(
  userDayOfWeek: number, // dayOfWeek in user's preferred format
  userWeekStartsOn: WeekStartDay,
): number {
  if (userWeekStartsOn === 1) {
    // User prefers Monday-first: no translation needed
    return userDayOfWeek
  } else {
    // User prefers Sunday-first: reverse the backwards shift (shift forward by 1)
    return (userDayOfWeek + 1) % 7 // Shift forward by 1 to get back to template format
  }
}
