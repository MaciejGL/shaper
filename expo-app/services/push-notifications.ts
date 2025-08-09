/**
 * Mobile Push Notification Service
 * Integrates with the web app's existing push notification system
 */
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { APP_CONFIG } from '../config/app-config'

// Store current push token in memory
let currentPushToken: string | null = null

// Configure notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface PushNotificationRegistration {
  expoPushToken: string
  userId: string
}

/**
 * Register for push notifications and get Expo push token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!')
      return null
    }

    // Get the token that identifies this installation
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data
  } else {
    console.warn('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Hypertro Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    })
  }

  // Store token for later use
  currentPushToken = token
  return token
}

/**
 * Send push token to web app backend
 */
export async function syncPushTokenWithBackend(
  expoPushToken: string,
  authToken?: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${APP_CONFIG.API_URL}/mobile/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': APP_CONFIG.USER_AGENT,
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        expoPushToken,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
        },
      }),
    })

    if (response.ok) {
      console.info('✅ Push token synced successfully with backend')
      return true
    } else {
      console.error(`❌ Failed to sync push token: HTTP ${response.status}`)
      return false
    }
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      console.error(
        '❌ Error syncing push token: [TypeError: Network request failed]',
      )
      console.warn('⚠️ Could not sync push token with backend')
    } else {
      console.error('❌ Error syncing push token:', error)
    }
    return false
  }
}

/**
 * Handle incoming push notifications
 * NOTE: Notification taps are handled by PushNotificationManager
 */
export function setupNotificationHandlers() {
  // Handle notifications that are received while the app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.info(
        '📱 Notification received:',
        notification.request.content.title,
      )
      // Custom UI handling can be added here if needed
    },
  )

  return () => {
    notificationListener.remove()
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  await Notifications.dismissAllNotificationsAsync()
}

/**
 * Get current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync()
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count)
}

/**
 * Initialize push notifications system
 * Only call this when user is authenticated
 */
export async function initializePushNotifications(authToken?: string) {
  try {
    // Ensure we have an authenticated user
    if (!authToken) {
      console.warn(
        '⚠️ Cannot initialize push notifications without authentication',
      )
      return null
    }

    // Register for push notifications
    const token = await registerForPushNotifications()

    if (!token) {
      console.warn('⚠️ Could not get push notification token')
      return null
    }

    // Sync with backend
    const synced = await syncPushTokenWithBackend(token, authToken)

    if (!synced) {
      console.warn('⚠️ Could not sync push token with backend')
      // Still return success as the token is valid, sync can be retried later
    }

    // Setup notification handlers
    const cleanup = setupNotificationHandlers()

    return {
      token,
      cleanup,
    }
  } catch (error) {
    console.error('❌ Failed to initialize push notifications:', error)
    return null
  }
}

/**
 * Check current push notification permission status
 */
export async function getPushNotificationStatus() {
  try {
    const { status } = await Notifications.getPermissionsAsync()
    return {
      status,
      isGranted: status === 'granted',
      canAskAgain: status === 'undetermined',
      isDenied: status === 'denied',
    }
  } catch (error) {
    console.error('❌ Error checking push notification status:', error)
    return {
      status: 'unknown',
      isGranted: false,
      canAskAgain: false,
      isDenied: false,
    }
  }
}

/**
 * Get the current push token
 */
export function getCurrentPushToken(): string | null {
  return currentPushToken
}

/**
 * Update push notification preferences in the backend
 */
export async function updatePushNotificationPreferences(
  enabled: boolean,
  authToken?: string,
): Promise<boolean> {
  try {
    if (!currentPushToken) {
      console.warn('⚠️ No push token available to update preferences')
      return false
    }

    if (!authToken) {
      console.warn('⚠️ Cannot update push preferences without authentication')
      return false
    }

    const response = await fetch(`${APP_CONFIG.API_URL}/mobile/push-token`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': APP_CONFIG.USER_AGENT,
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        expoPushToken: currentPushToken,
        pushNotificationsEnabled: enabled,
      }),
    })

    if (response.ok) {
      console.info(
        `✅ Push notification preferences updated: ${enabled ? 'enabled' : 'disabled'}`,
      )
      return true
    } else {
      console.error(
        `❌ Failed to update push preferences: HTTP ${response.status}`,
      )
      return false
    }
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      console.error(
        '❌ Error updating push preferences: [TypeError: Network request failed]',
      )
      console.warn('⚠️ Could not update push preferences with backend')
    } else {
      console.error('❌ Error updating push preferences:', error)
    }
    return false
  }
}

/**
 * Disable push notifications (both locally and in backend)
 */
export async function disablePushNotifications(
  authToken?: string,
): Promise<boolean> {
  try {
    // Update backend first
    const backendUpdated = await updatePushNotificationPreferences(
      false,
      authToken,
    )

    if (!backendUpdated) {
      console.warn('⚠️ Failed to disable push notifications in backend')
      return false
    }

    console.info('✅ Push notifications disabled successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to disable push notifications:', error)
    return false
  }
}

/**
 * Test notification (for development)
 */
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hypertro Test 🏋️',
      body: 'This is a test notification from your mobile app!',
      data: { url: '/fitspace' },
    },
    trigger: { seconds: 1 } as Notifications.TimeIntervalTriggerInput,
  })
}
