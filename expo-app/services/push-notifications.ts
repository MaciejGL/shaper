/**
 * Mobile Push Notification Service - Enhanced for User Switching
 * Integrates with the web app's existing push notification system
 */
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { APP_CONFIG } from '../config/app-config'

// Store current push token in memory
let currentPushToken: string | null = null
let isInitialized = false
let currentUserId: string | null = null // Enhanced: Track current user

// Helper to extract user ID from auth token
function extractUserIdFromToken(authToken: string): string {
  // Auth token format: "session:email:timestamp"
  return authToken.split(':')[1] || authToken.slice(0, 50) // Fallback to first 50 chars
}

// Configure notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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
      // Only log on first sync or errors - reduce spam
      if (APP_CONFIG.IS_DEV) {
        console.info('✅ Push token synced with backend')
      }
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

// Track if handlers are already set up to prevent duplicates
let handlersSetup = false

/**
 * Handle incoming push notifications
 * NOTE: Notification taps are handled by PushNotificationManager
 */
export function setupNotificationHandlers() {
  if (handlersSetup) {
    console.info('📱 Notification handlers already set up')
    return () => {} // Return empty cleanup function
  }

  // Handle notifications that are received while the app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      if (APP_CONFIG.IS_DEV) {
        console.info('📱 Notification:', notification.request.content.title)
      }
      // Custom UI handling can be added here if needed
    },
  )

  handlersSetup = true

  return () => {
    notificationListener.remove()
    handlersSetup = false
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
 * Enhanced to detect user switching and force re-initialization
 */
export async function initializePushNotifications(
  authToken?: string,
  force: boolean = false,
) {
  try {
    // Ensure we have an authenticated user
    if (!authToken) {
      if (APP_CONFIG.IS_DEV) {
        console.warn(
          '⚠️ Cannot initialize push notifications without authentication',
        )
      }
      return null
    }

    const newUserId = extractUserIdFromToken(authToken)

    // Check if this is a different user
    const isDifferentUser = currentUserId && currentUserId !== newUserId

    if (isDifferentUser) {
      console.info('📱 Different user detected, forcing re-initialization')
      await resetForUserSwitch(authToken)
      force = true // Force re-initialization for new user
    } else {
      currentUserId = newUserId
    }

    // Check if already initialized (unless forced or different user)
    if (isInitialized && !force && currentPushToken) {
      if (APP_CONFIG.IS_DEV) {
        console.info(
          '📱 Push notifications already initialized for current user',
        )
      }
      return {
        token: currentPushToken,
        cleanup: () => {},
      }
    }

    console.info('📱 Initializing push notifications for user:', newUserId)

    // Always register for push notifications (get fresh token)
    const token = await registerForPushNotifications()

    if (!token) {
      console.warn('⚠️ Could not get push notification token')
      return null
    }

    // Always sync token for new users or when forced
    const synced = await syncPushTokenWithBackend(token, authToken)

    if (!synced) {
      console.warn('⚠️ Could not sync push token with backend')
      // Still return success as the token is valid, sync can be retried later
    }

    // Setup notification handlers (prevents duplicates internally)
    const cleanup = setupNotificationHandlers()

    isInitialized = true
    currentUserId = newUserId

    console.info('✅ Push notifications initialized for user:', newUserId)

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
 * Reset initialization state (for testing or when disabling notifications)
 * Enhanced to handle user switching properly
 */
export function resetPushNotificationState() {
  console.info('📱 Resetting push notification state')
  isInitialized = false
  handlersSetup = false
  currentPushToken = null
  currentUserId = null
}

/**
 * Reset state for user switching - more aggressive cleanup
 */
export async function resetForUserSwitch(newAuthToken?: string) {
  console.info('📱 Resetting push state for user switch')

  // Disable previous user's token in backend if we have one
  if (currentPushToken && currentUserId) {
    try {
      await updatePushNotificationPreferences(
        false,
        `session:${currentUserId}:0`,
      )
    } catch (error) {
      console.warn('⚠️ Could not disable previous user token:', error)
    }
  }

  // Reset all state
  resetPushNotificationState()

  // Update current user
  if (newAuthToken) {
    currentUserId = extractUserIdFromToken(newAuthToken)
  }
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

    // Reset state so they can be re-enabled properly later
    resetPushNotificationState()

    if (APP_CONFIG.IS_DEV) {
      console.info('✅ Push notifications disabled successfully')
    }
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
