'use client'

import { useMobileApp } from '@/components/mobile-app-bridge'

import { DesktopPushSettings } from './push-notification/desktop-push-settings'
import { MobilePushSettings } from './push-notification/mobile-push-settings'

export function PushNotificationSettings() {
  const { isNativeApp } = useMobileApp()

  if (!isNativeApp) {
    return <DesktopPushSettings />
  }
  return <MobilePushSettings />
}
