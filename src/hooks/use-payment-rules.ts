'use client'

import { useMobileApp } from '@/components/mobile-app-bridge'
import {
  PAYMENT_RULES,
  PaymentRule,
  Platform,
  getRegionFromTimezone,
} from '@/config/payment-rules'
import { useUser } from '@/context/user-context'

/**
 * Returns payment rules for the current user's region and platform.
 * Used to conditionally render upgrade UI based on compliance requirements.
 *
 * @example
 * const rules = usePaymentRules()
 * if (rules.canShowUpgradeUI) {
 *   // Show pricing and upgrade buttons
 * }
 */
export function usePaymentRules(): PaymentRule {
  const { user } = useUser()
  const { isNativeApp, platform } = useMobileApp()

  const region = getRegionFromTimezone(user?.profile?.timezone)

  // Determine device platform
  let devicePlatform: Platform = 'web'
  if (isNativeApp) {
    devicePlatform = platform === 'ios' ? 'ios' : 'android'
  }

  // Get rules for region, fallback to DEFAULT
  const regionRules = PAYMENT_RULES[region] ?? PAYMENT_RULES.DEFAULT
  if (process.env.NEXT_PUBLIC_PLATFORM) {
    devicePlatform = process.env.NEXT_PUBLIC_PLATFORM as Platform
  }
  console.info(devicePlatform, regionRules[devicePlatform])
  return regionRules[devicePlatform]
}
