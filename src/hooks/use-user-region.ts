'use client'

import { useMemo } from 'react'

import { EU_COUNTRIES } from '@/config/payment-rules'
import { useUser } from '@/context/user-context'

/**
 * Timezone to country code mapping
 * Used to infer user's country from their browser timezone
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Norway
  'Europe/Oslo': 'NO',

  // US timezones
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',

  // EU countries
  'Europe/Vienna': 'AT',
  'Europe/Brussels': 'BE',
  'Europe/Sofia': 'BG',
  'Europe/Zagreb': 'HR',
  'Asia/Nicosia': 'CY',
  'Europe/Prague': 'CZ',
  'Europe/Copenhagen': 'DK',
  'Europe/Tallinn': 'EE',
  'Europe/Helsinki': 'FI',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Athens': 'GR',
  'Europe/Budapest': 'HU',
  'Europe/Dublin': 'IE',
  'Europe/Rome': 'IT',
  'Europe/Riga': 'LV',
  'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU',
  'Europe/Malta': 'MT',
  'Europe/Amsterdam': 'NL',
  'Europe/Warsaw': 'PL',
  'Europe/Lisbon': 'PT',
  'Europe/Bucharest': 'RO',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Madrid': 'ES',
  'Europe/Stockholm': 'SE',
}

/**
 * Get user's country code from browser timezone
 */
function getCountryFromTimezone(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_TO_COUNTRY[timezone] || null
  } catch {
    return null
  }
}

/**
 * Hook to detect the user's country/region
 * Uses browser timezone to infer country since we don't store country in profile
 */
export function useUserRegion() {
  const { user } = useUser()

  // Get region from user's timezone (stored in profile) or browser timezone
  const region = useMemo(() => {
    // First try: Use profile timezone if available
    const profileTimezone = user?.profile?.timezone
    if (profileTimezone && TIMEZONE_TO_COUNTRY[profileTimezone]) {
      return TIMEZONE_TO_COUNTRY[profileTimezone]
    }

    // Second try: Detect from browser timezone
    return getCountryFromTimezone()
  }, [user?.profile?.timezone])

  return {
    region,
    isUS: region === 'US',
    isEU: region
      ? EU_COUNTRIES.includes(region as (typeof EU_COUNTRIES)[number])
      : false,
    isNorway: region === 'NO',
  }
}
