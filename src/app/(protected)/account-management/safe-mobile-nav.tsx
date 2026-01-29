'use client'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { useIsMobileDevice } from '@/hooks/use-is-mobile-device'

import { MobileNav } from '../fitspace/components/mobile-nav'

interface SafeMobileNavProps {
  hasNutritionAccess?: boolean
}

/**
 * SafeMobileNav - Mobile navigation with device detection
 *
 * Uses deep links only when on actual mobile devices (iOS/Android).
 * This prevents desktop users from triggering app-specific deep links.
 *
 * Used in account-management which opens in external browser (Safari/Chrome)
 * and needs to return to the mobile app.
 */
export function SafeMobileNav({ hasNutritionAccess = false }: SafeMobileNavProps) {
  const isMobileDevice = useIsMobileDevice()
  const { isNativeApp } = useMobileApp()

  if (!isNativeApp) return null

  return (
    <MobileNav
      useDeepLinks={isMobileDevice}
      hasNutritionAccess={hasNutritionAccess}
    />
  )
}
