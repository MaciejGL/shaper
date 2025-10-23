'use client'

import { CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLUserRole } from '@/generated/graphql-client'

/**
 * Desktop-specific push notification settings
 * Shows mobile-only message and preferences for existing subscriptions
 */
export function DesktopPushSettings() {
  const { user } = useUser()
  const { preferences, setNotifications } = useUserPreferences()
  const checkinRemindersEnabled =
    preferences.notifications?.checkinReminders ?? true
  const isTrainer = user?.role === GQLUserRole.Trainer

  const handleCheckinToggle = (checked: boolean) => {
    setNotifications({ checkinReminders: checked })
  }

  return (
    <div className="space-y-6">
      <div>
        <div>
          <div className="flex items-center gap-3">
            <div>
              <CardDescription>
                Push notifications are available on mobile devices only. Use
                your phone or tablet to enable push notifications.
              </CardDescription>
            </div>
          </div>
        </div>
      </div>

      {!isTrainer && (
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
