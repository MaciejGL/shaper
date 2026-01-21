'use client'

import { useEffect, useRef } from 'react'

import { useUpdateProfileMutation } from '@/generated/graphql-client'

/**
 * Simple hook to sync user's timezone on login
 */
export function useSyncTimezone(timezone?: string | null) {
  const { mutate: updateProfile } = useUpdateProfileMutation()
  const hasSetTimezoneRef = useRef(false)

  useEffect(() => {
    // Only set timezone once if it doesn't exist yet.
    if (timezone) return
    if (hasSetTimezoneRef.current) return

    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    hasSetTimezoneRef.current = true
    updateProfile({
      input: { timezone: currentTimezone },
    })
  }, [timezone, updateProfile])
}
