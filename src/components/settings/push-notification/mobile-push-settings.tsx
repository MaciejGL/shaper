'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff } from 'lucide-react'
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
import { useProfileQuery } from '@/generated/graphql-client'

import { NotificationPreferences } from './notification-preferences'

/**
 * Native Mobile App Push Notification Settings
 * Enhanced for bulletproof permission handling
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const queryClient = useQueryClient()

  const pushEnabled = preferences.notifications?.pushNotifications ?? false

  // Function to invalidate profile query and force refresh
  const invalidateProfile = async () => {
    await queryClient.invalidateQueries({
      queryKey: useProfileQuery.getKey(),
    })
  }

  const handleEnablePushNotifications = async () => {
    if (!isNativeApp) {
      toast.error('Push notifications are only available in the mobile app')
      return
    }

    setIsLoading(true)
    try {
      // Request permissions from mobile app (this will show the system dialog)
      requestPushPermissions()

      // Give user time to respond to permission dialog
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Check the actual permission status after user interaction
      checkPushPermissions()

      // Wait for initial status check to complete
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Start checking for status updates with exponential backoff
      await checkPermissionStatusWithRetry()

      toast.success(
        'Permission check complete. Your settings have been updated if permissions were granted.',
      )
    } catch (error) {
      console.error('Error requesting push permissions:', error)
      toast.error('Failed to request push permissions')
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced permission status checking with retry mechanism
  const checkPermissionStatusWithRetry = async (maxRetries = 3) => {
    setIsCheckingStatus(true)
    let attempts = 0
    const baseDelay = 2000 // Start with 2 seconds

    while (attempts < maxRetries) {
      try {
        // Force check permissions in mobile app
        checkPushPermissions()

        // Wait for mobile app to sync with backend
        await new Promise((resolve) => setTimeout(resolve, baseDelay))

        // Force refresh the profile data from server
        await invalidateProfile()

        // Wait a bit more for the query to complete
        await new Promise((resolve) => setTimeout(resolve, 1000))

        attempts++

        // If this isn't the last attempt, add exponential backoff delay
        if (attempts < maxRetries) {
          const delayMultiplier = Math.pow(2, attempts) // 2^attempt
          await new Promise((resolve) =>
            setTimeout(resolve, baseDelay * delayMultiplier),
          )
        }
      } catch (error) {
        console.error(`Permission check attempt ${attempts + 1} failed:`, error)
        attempts++
      }
    }

    setIsCheckingStatus(false)
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
      // Optimistically update UI immediately
      setNotifications({ pushNotifications: false })

      // Disable in mobile app (which updates backend)
      disablePushPermissions()

      // Wait for backend sync
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Force refresh profile data to ensure consistency
      await invalidateProfile()

      toast.success('Push notifications disabled successfully')
    } catch (error) {
      console.error('Error disabling push notifications:', error)
      // Revert optimistic update on error
      await invalidateProfile()
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isNativeApp) {
    return <MobileAppBanner />
  }

  console.log('isNativeApp', isNativeApp, pushEnabled)

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
                disabled={
                  isLoading ||
                  isCheckingStatus ||
                  !capabilities.canRequestPushPermissions
                }
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                {isLoading
                  ? 'Requesting Permission...'
                  : isCheckingStatus
                    ? 'Checking Status...'
                    : 'Enable Push Notifications'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDisablePushNotifications}
                disabled={
                  isLoading ||
                  isCheckingStatus ||
                  !capabilities.canDisablePushPermissions
                }
                className="gap-2"
              >
                <BellOff className="w-4 h-4" />
                {isLoading ? 'Disabling...' : 'Disable Notifications'}
              </Button>
            )}
          </div>

          {/* Status checking indicator */}
          {isCheckingStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-blue-900">
                    Syncing notification status...
                  </p>
                  <p className="text-xs text-blue-700">
                    Checking with your device settings and updating preferences.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Tip:</strong> If you previously denied notifications, you
              may need to enable them in your device settings. The app will
              automatically detect when you've enabled them.
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
