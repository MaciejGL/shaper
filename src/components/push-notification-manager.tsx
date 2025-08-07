'use client'

import { Bell, BellOff, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  getSubscriptionCount,
  sendAchievementNotification,
  sendCoachingNotification,
  sendMealReminder,
  sendTestNotification,
  sendWorkoutReminder,
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
import { Input } from '@/components/ui/input'
import { useUserPreferences } from '@/context/user-preferences-context'

// Utility function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Convert browser PushSubscription to web-push compatible format
function convertPushSubscription(subscription: PushSubscription): {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
} {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
      auth: arrayBufferToBase64(subscription.getKey('auth')!),
    },
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function PushNotificationManager() {
  const { preferences, updatePreferences } = useUserPreferences()
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [subscriptionCount, setSubscriptionCount] = useState(0)

  const pushNotificationsEnabled =
    preferences.notifications?.pushNotifications ?? false

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      // Check for existing subscription
      const existingSubscription =
        await registration.pushManager.getSubscription()
      setSubscription(existingSubscription)

      // Get subscription count
      const { count } = await getSubscriptionCount()
      setSubscriptionCount(count)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      toast.error('Failed to register service worker')
    }
  }

  async function subscribeToPush() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      toast.error('VAPID public key not configured')
      return
    }

    setIsLoading(true)
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Push notifications permission denied')
        setIsLoading(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        ),
      })

      setSubscription(sub)

      const result = await subscribeUser(convertPushSubscription(sub))
      if (result.success) {
        // Enable push notifications in user preferences
        await updatePreferences({
          notifications: {
            ...preferences.notifications,
            pushNotifications: true,
          },
        })

        toast.success('✅ Successfully subscribed to push notifications!')
        // Update subscription count
        const { count } = await getSubscriptionCount()
        setSubscriptionCount(count)
      } else {
        toast.error('Failed to subscribe: ' + result.error)
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to subscribe to push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true)
    try {
      await subscription?.unsubscribe()
      setSubscription(null)

      const result = await unsubscribeUser()
      if (result.success) {
        // Disable push notifications in user preferences
        await updatePreferences({
          notifications: {
            ...preferences.notifications,
            pushNotifications: false,
          },
        })

        toast.success('✅ Successfully unsubscribed from push notifications')
        // Update subscription count
        const { count } = await getSubscriptionCount()
        setSubscriptionCount(count)
      } else {
        toast.error('Failed to unsubscribe: ' + result.error)
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to unsubscribe from push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendNotification(message: string) {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsLoading(true)
    try {
      const result = await sendTestNotification(message)
      if (result.success) {
        toast.success(`📧 ${result.message || 'Notification sent!'}`)
        setCustomMessage('')
      } else {
        toast.error('Failed to send notification: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  async function sendPresetNotification(type: string) {
    setIsLoading(true)
    try {
      let result
      switch (type) {
        case 'workout':
          result = await sendWorkoutReminder('Upper Body Strength')
          break
        case 'meal':
          result = await sendMealReminder('lunch')
          break
        case 'coaching':
          result = await sendCoachingNotification(
            'Great progress this week! Keep it up!',
          )
          break
        case 'achievement':
          result = await sendAchievementNotification('7-day workout streak!')
          break
        default:
          result = await sendTestNotification('Hello from Shaper! 👋')
      }

      if (result.success) {
        toast.success(`📧 ${result.message || 'Notification sent!'}`)
      } else {
        toast.error('Failed to send notification: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending preset notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Please use a modern
            browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Test push notifications for your Shaper app. These will work even when
          the app is closed! Your preference:{' '}
          {pushNotificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
        </CardDescription>
        {subscriptionCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {subscriptionCount} active subscription
            {subscriptionCount !== 1 ? 's' : ''}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Notification Status</p>
            <p className="text-sm text-muted-foreground">
              {subscription && pushNotificationsEnabled
                ? '✅ Subscribed & Enabled'
                : subscription
                  ? '🔕 Subscribed but Disabled in Preferences'
                  : '❌ Not subscribed'}
            </p>
          </div>

          {!subscription ? (
            <Button onClick={subscribeToPush} disabled={isLoading}>
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>
          )}
        </div>

        {/* Test Notifications */}
        {subscription && (
          <>
            <div className="space-y-3">
              <h3 className="font-medium">Send Custom Notification</h3>
              <div className="flex gap-2">
                <Input
                  id="custom-message"
                  placeholder="Enter your message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && sendNotification(customMessage)
                  }
                />
                <Button
                  onClick={() => sendNotification(customMessage)}
                  disabled={isLoading || !customMessage.trim()}
                  size="icon-md"
                  iconOnly={<Send />}
                ></Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Quick Test Notifications</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => sendPresetNotification('workout')}
                  disabled={isLoading}
                  className="text-left"
                >
                  🏋️ Workout Reminder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendPresetNotification('meal')}
                  disabled={isLoading}
                  className="text-left"
                >
                  🍽️ Meal Reminder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendPresetNotification('coaching')}
                  disabled={isLoading}
                  className="text-left"
                >
                  📝 Coach Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendPresetNotification('achievement')}
                  disabled={isLoading}
                  className="text-left"
                >
                  🎉 Achievement
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Minimize or close your browser after
                sending a notification to see it work in the background!
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
