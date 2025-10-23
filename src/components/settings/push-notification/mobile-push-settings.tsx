'use client'

import { Bell, BellOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { MobileAppBanner } from '@/components/mobile-app-banner'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLUserRole } from '@/generated/graphql-client'

export function MobilePushSettings() {
  const { user } = useUser()
  const { preferences, setNotifications } = useUserPreferences()
  const { isNativeApp, requestPushPermissions, disablePushPermissions } =
    useMobileApp()
  const [isLoading, setIsLoading] = useState(false)
  const pushEnabled = preferences.notifications?.pushNotifications ?? false
  const checkinRemindersEnabled =
    preferences.notifications?.checkinReminders ?? true
  const isTrainer = user?.role === GQLUserRole.Trainer

  const handleToggle = () => {
    if (!isNativeApp) return

    setIsLoading(true)

    if (pushEnabled) {
      setNotifications({ pushNotifications: false })
      disablePushPermissions()
      toast.success('Push notifications disabled')
    } else {
      setNotifications({ pushNotifications: true })
      requestPushPermissions()
      toast.success('Push notifications enabled')
    }

    setIsLoading(false)
  }

  const handleCheckinToggle = (checked: boolean) => {
    setNotifications({ checkinReminders: checked })
    toast.success(
      checked ? 'Check-in reminders enabled' : 'Check-in reminders disabled',
    )
  }

  if (!isNativeApp) {
    return <MobileAppBanner />
  }

  return (
    <div className="flex flex-col gap-6">
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
              {pushEnabled
                ? 'Receiving notifications'
                : 'Enable to get notified'}
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

      {pushEnabled && !isTrainer && (
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex-1">
            <p className="font-medium">Check-in Reminders</p>
            <p className="text-sm text-muted-foreground">
              Get reminded to log your progress measurements and photos
            </p>
          </div>
          <Switch
            checked={checkinRemindersEnabled}
            onCheckedChange={handleCheckinToggle}
          />
        </div>
      )}
    </div>
  )
}
