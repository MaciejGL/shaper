'use client'

import { useEffect } from 'react'

import { useUpdateProfileMutation } from '@/generated/graphql-client'

/**
 * Simple hook to sync user's timezone on login
 */
export function useSyncTimezone(timezone?: string) {
  const updateProfile = useUpdateProfileMutation()

  useEffect(() => {
    // if (!timezone) return

    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (timezone !== currentTimezone) {
      updateProfile.mutate({
        input: { timezone: currentTimezone },
      })
    }
  }, [timezone, updateProfile])
}
