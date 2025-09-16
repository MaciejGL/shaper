'use client'

import { CardDescription } from '@/components/ui/card'

/**
 * Desktop-specific push notification settings
 * Shows mobile-only message and preferences for existing subscriptions
 */
export function DesktopPushSettings() {
  return (
    <div className="space-y-6">
      {/* Mobile-only notification */}
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
    </div>
  )
}
