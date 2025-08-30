'use client'

import { toast } from 'sonner'

import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'

interface NotificationPreferencesProps {
  /** Optional ID prefix to avoid conflicts when used multiple times */
  idPrefix?: string
}

/**
 * Shared component for notification type preferences
 * Can be used in both desktop and mobile contexts
 */
export function NotificationPreferences({
  idPrefix = '',
}: NotificationPreferencesProps) {
  const { preferences, setNotifications } = useUserPreferences()

  const handleNotificationTypeToggle = (
    type: keyof typeof preferences.notifications,
    enabled: boolean,
  ) => {
    setNotifications({ [type]: enabled })
    toast.success(
      `${type.replace(/([A-Z])/g, ' $1').toLowerCase()} ${enabled ? 'enabled' : 'disabled'}`,
    )
  }

  const getId = (base: string) => (idPrefix ? `${idPrefix}-${base}` : base)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={getId('workout-reminders')} className="font-medium">
            Workout Reminders
          </Label>
          <p className="text-sm text-muted-foreground">
            Get notified when it's time for your scheduled workouts
          </p>
        </div>
        <Switch
          id={getId('workout-reminders')}
          checked={preferences.notifications?.workoutReminders ?? true}
          onCheckedChange={(enabled) =>
            handleNotificationTypeToggle('workoutReminders', enabled)
          }
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={getId('meal-reminders')} className="font-medium">
            Meal Reminders
          </Label>
          <p className="text-sm text-muted-foreground">
            Reminders to log your meals and stay on track
          </p>
        </div>
        <Switch
          id={getId('meal-reminders')}
          checked={preferences.notifications?.mealReminders ?? true}
          onCheckedChange={(enabled) =>
            handleNotificationTypeToggle('mealReminders', enabled)
          }
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={getId('progress-updates')} className="font-medium">
            Progress Updates
          </Label>
          <p className="text-sm text-muted-foreground">
            Celebrate achievements and milestone notifications
          </p>
        </div>
        <Switch
          id={getId('progress-updates')}
          checked={preferences.notifications?.progressUpdates ?? true}
          onCheckedChange={(enabled) =>
            handleNotificationTypeToggle('progressUpdates', enabled)
          }
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label
            htmlFor={getId('system-notifications')}
            className="font-medium"
          >
            System Notifications
          </Label>
          <p className="text-sm text-muted-foreground">
            Important app updates and announcements
          </p>
        </div>
        <Switch
          id={getId('system-notifications')}
          checked={preferences.notifications?.systemNotifications ?? true}
          onCheckedChange={(enabled) =>
            handleNotificationTypeToggle('systemNotifications', enabled)
          }
        />
      </div>
    </div>
  )
}
