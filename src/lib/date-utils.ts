import { addDays, format, parseISO, startOfWeek } from 'date-fns'

export type WeekStartDay = 0 | 1 // 0 = Sunday, 1 = Monday

// User preference - this could come from user settings/context in the future
export const DEFAULT_WEEK_START: WeekStartDay = 1 // Monday

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
    isDayMatch: (selectedDateString: string, targetDayOfWeek: number) =>
      isDayMatch(selectedDateString, targetDayOfWeek, weekStartsOn),
    normalizeDay: (jsDay: number) => normalizeDay(jsDay, weekStartsOn),
    denormalizeDay: (normalizedDay: number) =>
      denormalizeDay(normalizedDay, weekStartsOn),
  }
}
