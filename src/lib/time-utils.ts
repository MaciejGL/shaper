import { format } from 'date-fns'

export type TimeFormat = '12h' | '24h'

/**
 * Format time according to user preference
 */
export function formatTime(
  date: Date | string,
  timeFormat: TimeFormat,
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (timeFormat === '12h') {
    return format(dateObj, 'h:mm a')
  }

  return format(dateObj, 'HH:mm')
}

/**
 * Format date with time according to user preference
 */
export function formatDateTime(
  date: Date | string,
  timeFormat: TimeFormat,
  options?: {
    includeYear?: boolean
    includeDay?: boolean
    dateFormat?: 'short' | 'long'
  },
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const {
    includeYear = false,
    includeDay = false,
    dateFormat = 'short',
  } = options || {}

  let datePattern = ''

  if (includeDay) {
    datePattern = dateFormat === 'long' ? 'EEEE, ' : 'eee, '
  }

  if (includeYear) {
    datePattern += dateFormat === 'long' ? 'd MMMM yyyy' : 'd MMM yyyy'
  } else {
    datePattern += dateFormat === 'long' ? 'd MMMM' : 'd MMM'
  }

  const timePattern = timeFormat === '12h' ? 'h:mm a' : 'HH:mm'

  return format(dateObj, `${datePattern} ${timePattern}`)
}

/**
 * Format time for input fields (always 24h format for easier parsing)
 */
export function formatTimeForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm')
}

/**
 * Parse time input and create a date with today's date
 */
export function parseTimeInput(timeString: string): Date | null {
  if (!timeString) return null

  const timeRegex = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  const match = timeString.trim().match(timeRegex)

  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const ampm = match[3]?.toUpperCase()

  if (minutes > 59) return null

  if (ampm) {
    // 12-hour format
    if (hours === 12 && ampm === 'AM') hours = 0
    if (hours !== 12 && ampm === 'PM') hours += 12
  }

  if (hours > 23) return null

  const now = new Date()
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
  )
}
