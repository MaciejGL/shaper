/**
 * Hook to monitor app state and sync push notification permissions
 */
import { useEffect } from 'react'
import { AppState } from 'react-native'

export function usePushNotificationSync(
  currentAuthToken: string | undefined,
  checkAndSyncPermissions: () => void,
) {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number | null = null

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && currentAuthToken) {
        // Debounce app state changes to prevent excessive calls
        if (timeoutId) clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
          console.info('📱 [PUSH-SYNC] App became active, checking permissions')
          checkAndSyncPermissions()
        }, 2000) // Wait 2 seconds after app becomes active
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => {
      subscription?.remove()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [currentAuthToken, checkAndSyncPermissions])
}

