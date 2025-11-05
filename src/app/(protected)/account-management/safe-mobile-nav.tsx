'use client'

import { useIsMobileDevice } from '@/hooks/use-is-mobile-device'

import { MobileNav } from '../fitspace/components/mobile-nav'

/**
 * SafeMobileNav - Mobile navigation with device detection
 *
 * Uses deep links only when on actual mobile devices (iOS/Android).
 * This prevents desktop users from triggering app-specific deep links.
 *
 * Used in account-management which opens in external browser (Safari/Chrome)
 * and needs to return to the mobile app.
 */
export function SafeMobileNav() {
  const isMobileDevice = useIsMobileDevice()

  return <MobileNav useDeepLinks={isMobileDevice} />
}
