'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'

/**
 * Mobile App Theme Sync
 *
 * Automatically syncs the web app theme with the mobile app
 * for consistent status bar and navigation bar styling.
 */
export function MobileAppThemeSync() {
  const { resolvedTheme } = useTheme()
  const { isNativeApp, updateTheme } = useMobileApp()

  useEffect(() => {
    if (isNativeApp && resolvedTheme) {
      // Sync theme with mobile app (only 'light' or 'dark' supported)
      const mobileTheme = resolvedTheme === 'dark' ? 'dark' : 'light'
      updateTheme(mobileTheme)
    }
  }, [isNativeApp, resolvedTheme, updateTheme])

  // This component renders nothing - it's just for side effects
  return null
}
