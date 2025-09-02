'use client'

import { PushNotificationSettings } from '@/components/settings/push-notification-settings'

/**
 * Trainer-specific notification settings
 * Reuses the same push notification settings component that works for fitspace users
 * This ensures trainers get the same mobile app push notification controls
 */
export function TrainerNotificationSection() {
  return <PushNotificationSettings />
}
