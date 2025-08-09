'use client'

import { useMobileApp } from '@/components/mobile-app-bridge'

import { DesktopPushSettings } from './push-notification/desktop-push-settings'
import { MobilePushSettings } from './push-notification/mobile-push-settings'

/**
 * Main push notification settings component
 * Shows native mobile app push settings or desktop preferences
 */
export function PushNotificationSettings() {
  const { isNativeApp } = useMobileApp()

  // Desktop users - show preferences only (no push notifications)
  if (!isNativeApp) {
    return <DesktopPushSettings hasSubscriptions={false} />
  }

  // Mobile users - show native app push notification settings
  // This component handles both native app and web browser cases
  return <MobilePushSettings />
}
