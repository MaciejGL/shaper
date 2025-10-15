'use client'

import { useEffect } from 'react'

import { useUpdateProfileMutation } from '@/generated/graphql-client'

/**
 * Simple hook to sync user's timezone on login
 */
export function useSyncTimezone(timezone?: string) {
  const { mutate: updateProfile } = useUpdateProfileMutation()

  useEffect(() => {
    // if (!timezone) return

    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (timezone !== currentTimezone) {
      updateProfile({
        input: { timezone: currentTimezone },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
