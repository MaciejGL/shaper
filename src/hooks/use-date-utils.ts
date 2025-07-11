import { useMemo } from 'react'

import { useWeekStartPreference } from '@/context/user-preferences-context'
import { createDateUtils } from '@/lib/date-utils'

/**
 * Hook that provides date utilities with user preferences applied
 * @returns Date utility functions with user's week start preference
 */
export function useDateUtils() {
  const weekStartsOn = useWeekStartPreference()

  return useMemo(() => createDateUtils(weekStartsOn), [weekStartsOn])
}
