'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'

/**
 * Mobile App Authentication Sync
 *
 * Automatically sends authentication info to mobile app when user is logged in.
 * This enables push notification registration for authenticated users.
 *
 * Note: Since we use session-based auth, we send a simple signal rather than a JWT token.
 * The mobile app WebView will use session cookies for API calls.
 */
export function MobileAppAuthSync() {
  const { data: session, status } = useSession()
  const { isNativeApp, setAuthToken } = useMobileApp()

  useEffect(() => {
    if (isNativeApp && status === 'authenticated' && session?.user?.email) {
      // Send a simple auth signal to mobile app
      // The mobile app will use session cookies for actual API calls
      const authSignal = `session:${session.user.email}:${Date.now()}`

      console.info(
        '📱 Sending auth signal to mobile app for user:',
        session.user.email,
      )
      setAuthToken(authSignal)
    }
  }, [isNativeApp, status, session, setAuthToken])

  // This component renders nothing - it's just for side effects
  return null
}
