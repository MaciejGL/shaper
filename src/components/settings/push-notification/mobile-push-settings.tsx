'use client'

import { Bell, BellOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { MobileAppBanner } from '@/components/mobile-app-banner'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { useUserPreferences } from '@/context/user-preferences-context'

export function MobilePushSettings() {
  const { preferences, setNotifications } = useUserPreferences()
  const { isNativeApp, requestPushPermissions, disablePushPermissions } =
    useMobileApp()
  const [isLoading, setIsLoading] = useState(false)

  const pushEnabled = preferences.notifications?.pushNotifications ?? false

  const handleToggle = () => {
    if (!isNativeApp) return

    setIsLoading(true)

    if (pushEnabled) {
      // Disable: optimistic update + mobile call
      setNotifications({ pushNotifications: false })
      disablePushPermissions()
      toast.success('Push notifications disabled')
    } else {
      // Enable: optimistic update + mobile call
      setNotifications({ pushNotifications: true })
      requestPushPermissions()
      toast.success('Push notifications enabled')
    }

    setIsLoading(false)
  }

  if (!isNativeApp) {
    return <MobileAppBanner />
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="flex flex-col justify-center items-center gap-3">
        {pushEnabled ? (
          <Bell className="size-5 text-green-600" />
        ) : (
          <BellOff className="size-5 text-orange-600" />
        )}
        <div>
          <p className="font-medium">
            Push Notifications {pushEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-sm text-muted-foreground">
            {pushEnabled ? 'Receiving notifications' : 'Enable to get notified'}
          </p>
        </div>
      </div>
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        size="sm"
        variant={pushEnabled ? 'outline' : 'default'}
      >
        {pushEnabled ? 'Disable' : 'Enable'}
      </Button>
    </div>
  )
}
