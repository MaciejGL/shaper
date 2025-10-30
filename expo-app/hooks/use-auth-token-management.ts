/**
 * Hook to handle auth token changes and user switching
 */
import { useEffect, useState } from 'react'

import {
  resetForUserSwitch,
  resetPushNotificationState,
} from '../services/push-notifications'

export function useAuthTokenManagement(initialAuthToken?: string) {
  const [currentAuthToken, setCurrentAuthToken] = useState(initialAuthToken)

  const handleAuthToken = (token: string) => {
    console.info(
      '📱 [AUTH] Received token from web app:',
      token.slice(0, 10) + '...',
    )

    // Extract user ID for comparison (more robust than full token comparison)
    const newUserId = token.split(':')[1] || token.slice(0, 50)
    const currentUserId =
      currentAuthToken?.split(':')[1] || currentAuthToken?.slice(0, 50)

    // If this is a different user, reset push notification state
    if (currentAuthToken && currentUserId !== newUserId) {
      console.info('📱 [AUTH] Different user detected, resetting push state')
      resetForUserSwitch(token).catch((error) => {
        console.warn('⚠️ [AUTH] Error during user switch reset:', error)
        resetPushNotificationState()
      })
    }

    setCurrentAuthToken(token)
  }

  // Reset push notification state when user logs out
  useEffect(() => {
    if (!currentAuthToken) {
      console.info('📱 [AUTH] User logged out, resetting push state')
      resetPushNotificationState()
    }
  }, [currentAuthToken])

  return {
    currentAuthToken,
    handleAuthToken,
  }
}

