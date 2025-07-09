import { formatRelative } from 'date-fns'

/**
 * Format a date string as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  return formatRelative(date, now)
}
