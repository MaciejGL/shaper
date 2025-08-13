'use client'

import { Bell, BellOff, Settings } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { MobileAppBanner } from '@/components/mobile-app-banner'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUserPreferences } from '@/context/user-preferences-context'

import { NotificationPreferences } from './notification-preferences'

/**
 * Native Mobile App Push Notification Settings
 * Only works in the native mobile app - prompts web users to download app
 */
export function MobilePushSettings() {
  const { preferences, setNotifications } = useUserPreferences()
  const {
    isNativeApp,
    requestPushPermissions,
    checkPushPermissions,
    disablePushPermissions,
    capabilities,
  } = useMobileApp()
  const [isLoading, setIsLoading] = useState(false)

  const pushEnabled = preferences.notifications?.pushNotifications ?? false

  const handleEnablePushNotifications = async () => {
    if (!isNativeApp) {
      toast.error('Push notifications are only available in the mobile app')
      return
    }

    setIsLoading(true)
    try {
      await requestPushPermissions()
      setNotifications({ pushNotifications: true })
      // The mobile app will handle the success/error messaging
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      toast.error('Failed to enable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckPermissions = async () => {
    if (!isNativeApp) {
      toast.error('Permission check is only available in the mobile app')
      return
    }

    setIsLoading(true)
    try {
      await checkPushPermissions()
      toast.success('Checking permissions status...')
    } catch (error) {
      console.error('Error checking permissions:', error)
      toast.error('Failed to check permissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisablePushNotifications = async () => {
    if (!isNativeApp) {
      toast.error(
        'Push notification control is only available in the mobile app',
      )
      return
    }

    setIsLoading(true)
    try {
      // Disable in mobile app (which updates backend)
      disablePushPermissions()

      // Update local preferences
      setNotifications({ pushNotifications: false })

      toast.success('Push notifications disabled successfully')
    } catch (error) {
      console.error('Error disabling push notifications:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isNativeApp) {
    return <MobileAppBanner />
  }

  // Native app interface
  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  {pushEnabled
                    ? 'Receive notifications even when the app is closed'
                    : 'Enable push notifications to stay updated'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {pushEnabled ? (
            // Push notifications enabled
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <p className="font-medium">Push Notifications Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive notifications for workouts, meals, and
                    updates from your trainer.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Push notifications disabled
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <BellOff className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-orange-900">
                    Push Notifications Disabled
                  </p>
                  <p className="text-sm text-orange-700">
                    Enable push notifications to receive workout reminders and
                    coaching updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {!pushEnabled ? (
              <Button
                onClick={handleEnablePushNotifications}
                disabled={isLoading || !capabilities.canRequestPushPermissions}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDisablePushNotifications}
                disabled={isLoading || !capabilities.canDisablePushPermissions}
                className="gap-2"
              >
                <BellOff className="w-4 h-4" />
                {isLoading ? 'Disabling...' : 'Disable Notifications'}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleCheckPermissions}
              disabled={isLoading || !capabilities.canCheckPushPermissions}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {isLoading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Tip:</strong> If you previously denied notifications, you
              may need to enable them in your device settings. Use "Check
              Status" to detect when you've enabled them externally.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      {pushEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences idPrefix="mobile" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
