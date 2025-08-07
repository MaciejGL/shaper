'use client'

import { BellOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getSubscriptionCount } from '@/app/actions/push-notifications'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-is-mobile'

import { DesktopPushSettings } from './push-notification/desktop-push-settings'
import { MobilePushSettings } from './push-notification/mobile-push-settings'

/**
 * Main push notification settings component
 * Orchestrates desktop vs mobile experiences
 */
export function PushNotificationSettings() {
  const isMobile = useIsMobile()
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    loadSubscriptionCount()

    // Check support for mobile devices only
    if (isMobile && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
    } else {
      setIsSupported(false)
    }
  }, [isMobile])

  async function loadSubscriptionCount() {
    try {
      const { count } = await getSubscriptionCount()
      setSubscriptionCount(count)
    } catch (error) {
      console.error('Error loading subscription count:', error)
    }
  }

  // Desktop users - show preferences but no subscription
  if (!isMobile) {
    return <DesktopPushSettings hasSubscriptions={subscriptionCount > 0} />
  }

  // Mobile users with unsupported browsers
  if (!isSupported) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <BellOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">
                Push Notifications Not Available
              </CardTitle>
              <CardDescription>
                Your browser doesn't support push notifications. Please use a
                modern browser like Chrome, Firefox, or Safari.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // Mobile users with supported browsers
  return <MobilePushSettings />
}
