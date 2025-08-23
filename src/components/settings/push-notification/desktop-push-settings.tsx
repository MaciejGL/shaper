'use client'

import { Smartphone } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { NotificationPreferences } from './notification-preferences'

interface DesktopPushSettingsProps {
  /** Whether user has any existing push subscriptions */
  hasSubscriptions: boolean
}

/**
 * Desktop-specific push notification settings
 * Shows mobile-only message and preferences for existing subscriptions
 */
export function DesktopPushSettings({
  hasSubscriptions,
}: DesktopPushSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Mobile-only notification */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0 self-start">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Push Notifications (Mobile Only)
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Push notifications are available on mobile devices only. Use
                your phone or tablet to enable push notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Show notification preferences if user has existing subscriptions */}
      {hasSubscriptions && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage your notification preferences. Changes apply to all your
              devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences idPrefix="desktop" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
