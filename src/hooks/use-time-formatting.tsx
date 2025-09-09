import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTimeFormat } from '@/generated/graphql-client'
import {
  formatDateTime,
  formatTime,
  formatTimeForInput,
  parseTimeInput,
} from '@/lib/time-utils'

/**
 * Hook to handle time formatting based on user preferences
 */
export function useTimeFormatting() {
  const { preferences } = useUserPreferences()

  const formatTimeWithPreference = (date: Date | string): string => {
    return formatTime(date, preferences.timeFormat)
  }

  const formatDateTimeWithPreference = (
    date: Date | string,
    options?: {
      includeYear?: boolean
      includeDay?: boolean
      dateFormat?: 'short' | 'long'
    },
  ): string => {
    return formatDateTime(date, preferences.timeFormat, options)
  }

  const getTimeFormat = () => preferences.timeFormat

  const getTimePlaceholder = () => {
    return preferences.timeFormat === GQLTimeFormat.H12
      ? 'e.g. 2:30 PM'
      : 'e.g. 14:30'
  }

  const getTimeLabel = (baseLabel: string = 'Time') => {
    const format = preferences.timeFormat === GQLTimeFormat.H12 ? '12h' : '24h'
    return `${baseLabel} (${format})`
  }

  return {
    // Formatting functions
    formatTime: formatTimeWithPreference,
    formatDateTime: formatDateTimeWithPreference,
    formatTimeForInput,
    parseTimeInput,

    // Utility functions
    getTimeFormat,
    getTimePlaceholder,
    getTimeLabel,

    // Direct access to preference
    timeFormat: preferences.timeFormat,
  }
}
