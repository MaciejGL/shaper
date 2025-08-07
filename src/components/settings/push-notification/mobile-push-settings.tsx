'use client'

import { Bell, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  subscribeUser,
  unsubscribeUser,
} from '@/app/actions/push-notifications'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  convertPushSubscription,
  registerServiceWorker,
  urlBase64ToUint8Array,
} from '@/lib/push-notifications/utils'

import { NotificationPreferences } from './notification-preferences'

/**
 * Mobile-specific push notification settings
 * Includes subscription toggle and full notification management
 */
export function MobilePushSettings() {
  const { preferences, setNotifications } = useUserPreferences()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>('default')

  const pushEnabled = preferences.notifications?.pushNotifications ?? false

  useEffect(() => {
    checkPermission()
    checkSubscription()
  }, [])

  async function checkPermission() {
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
    }
  }

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  async function handlePushToggle(enabled: boolean) {
    setIsLoading(true)

    try {
      if (enabled) {
        // Request permission and subscribe
        const permission = await Notification.requestPermission()
        setPermissionState(permission)

        if (permission !== 'granted') {
          toast.error('Push notification permission denied')
          return
        }

        // Ensure service worker is registered
        await registerServiceWorker()
        const registration = await navigator.serviceWorker.ready
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        if (!vapidKey) {
          console.error('VAPID key not configured')
          return
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        const result = await subscribeUser(
          convertPushSubscription(subscription),
        )

        if (result.success) {
          setIsSubscribed(true)
          setNotifications({ pushNotifications: true })
          toast.success('Push notifications enabled!')
        } else {
          toast.error('Failed to enable push notifications: ' + result.error)
        }
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        await subscription?.unsubscribe()

        const result = await unsubscribeUser()
        if (result.success) {
          setIsSubscribed(false)
          setNotifications({ pushNotifications: false })
          toast.success('Push notifications disabled')
        } else {
          toast.error('Failed to disable push notifications: ' + result.error)
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error)
      toast.error(
        `Failed to update push notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  {isSubscribed && pushEnabled
                    ? 'Receive notifications even when the app is closed'
                    : 'Enable push notifications to stay updated'}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={pushEnabled && isSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={isLoading}
            />
          </div>
        </CardHeader>

        {permissionState === 'denied' && (
          <CardContent className="pt-0">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-destructive">
                    Permission Denied
                  </p>
                  <p className="text-sm text-destructive/80">
                    You've blocked notifications for this site. To enable them,
                    check your browser's notification settings for this site.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notification Types */}
      {pushEnabled && isSubscribed && (
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

      {/* Enable Push Notifications CTA */}
      {!pushEnabled && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">
                Enable Push Notifications
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                Stay connected with your fitness journey. Get workout reminders,
                progress updates, and coaching messages even when the app is
                closed.
              </p>
              <Button
                onClick={() => handlePushToggle(true)}
                disabled={isLoading}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
