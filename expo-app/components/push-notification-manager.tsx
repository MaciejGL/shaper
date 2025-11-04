/**
 * Push Notification Manager for Mobile App
 * Handles push notification registration and deep linking
 */
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import React, { useCallback, useEffect, useRef } from 'react'
import { Alert, Platform } from 'react-native'

import { APP_CONFIG } from '../config/app-config'
import {
  disablePushNotifications,
  getCurrentPushToken,
  initializePushNotifications,
} from '../services/push-notifications'

import { useWebViewNavigation } from './webview-navigation-manager'

/**
 * Normalize deep link URLs
 * Handles HTTPS URLs and relative paths from push notifications
 */
function normalizeDeepLink(url: string): string {
  if (!url) return url

  const normalized = url.trim()

  // If it's already a full HTTPS URL, return as-is
  if (normalized.startsWith('https://')) {
    return normalized
  }

  // If it's a relative path, convert to full HTTPS URL
  if (normalized.startsWith('/')) {
    return `${APP_CONFIG.WEB_URL}${normalized}`
  }

  return normalized
}

interface PushNotificationManagerProps {
  children: React.ReactNode
  // Optional: pass user authentication token when available
  authToken?: string
}

export function PushNotificationManager({
  children,
  authToken,
}: PushNotificationManagerProps) {
  const responseListener = useRef<Notifications.Subscription | null>(null)
  const linkingListener = useRef<(() => void) | null>(null)
  const { navigateToPath, isReady } = useWebViewNavigation()

  /**
   * Handle deep linking - navigate to specific parts of the app
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      try {
        // Normalize URL (convert paths to full HTTPS URLs)
        const normalizedUrl = normalizeDeepLink(url)

        // Parse the normalized URL
        const parsed = Linking.parse(normalizedUrl)

        // Handle OAuth handoff: {baseUrl}/login?oauth_code=XXX&success=true&next=/fitspace/workout
        const oauthCode = parsed.queryParams?.oauth_code as string | undefined

        if (oauthCode) {
          const next =
            (parsed.queryParams?.next as string) || '/fitspace/workout'

          // Navigate to exchange endpoint with code and next parameter
          // The endpoint will set session cookies and redirect to the final destination
          const exchangeUrl = `${APP_CONFIG.WEB_URL}/api/mobile-auth/exchange?code=${oauthCode}&next=${encodeURIComponent(next)}`

          const attemptExchange = (attempt = 1) => {
            if (isReady()) {
              navigateToPath(exchangeUrl)
            } else {
              if (attempt < 10) {
                setTimeout(() => attemptExchange(attempt + 1), 300 * attempt)
              }
            }
          }

          attemptExchange()
          return
        }

        // For HTTPS URLs, navigate directly
        if (normalizedUrl.startsWith(APP_CONFIG.WEB_URL)) {
          const attemptNavigation = (attempt = 1) => {
            if (isReady()) {
              navigateToPath(normalizedUrl)
            } else {
              if (attempt < 10) {
                setTimeout(() => attemptNavigation(attempt + 1), 300 * attempt)
              }
            }
          }

          attemptNavigation()
          return
        }
      } catch (error) {
        console.error(
          '❌ Error handling deep link:',
          error,
          'Original URL:',
          url,
        )
      }
    },
    [isReady, navigateToPath],
  )

  // ALWAYS set up deep link listeners (even when not authenticated)
  // This is critical for OAuth flow where user isn't authenticated yet
  useEffect(() => {
    // Set up deep linking listener for hot start (app already running)
    const handleUrl = (event: { url: string }) => {
      console.info(
        '📱 [PUSH-MANAGER] Deep link received (hot start):',
        event.url,
      )
      handleDeepLink(event.url)
    }

    // Listen for incoming deep links while app is running
    const linkingSubscription = Linking.addEventListener('url', handleUrl)
    linkingListener.current = () => linkingSubscription?.remove?.()

    // Handle deep link on cold start (app opened from closed state)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.info('📱 [PUSH-MANAGER] Deep link received (cold start):', url)
        handleDeepLink(url)
      }
    })

    // Cleanup listeners on unmount
    return () => {
      if (linkingListener.current) {
        linkingListener.current()
      }
    }
  }, [handleDeepLink])

  // Initialize push notifications only when authenticated
  useEffect(() => {
    if (!authToken) {
      if (APP_CONFIG.IS_DEV) {
        console.info(
          '📱 Waiting for user authentication before requesting push permissions',
        )
      }
      return
    }

    // Initialize push notifications for authenticated user (prevents duplicates internally)
    initializePushNotifications(authToken).then((result) => {
      if (result && APP_CONFIG.IS_DEV) {
        console.info('✅ Push notifications ready')
      } else if (!result) {
        console.warn('⚠️ Failed to initialize push notifications')
      }
    })

    // Note: Notification handling is now done in push-notifications service
    // to prevent duplicate handlers and excessive logging

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response
        const data = notification.request.content.data

        // Handle deep linking from notification
        if (data?.url) {
          const url = data.url as string
          // If it's already a full URL, handle as deep link
          if (url.startsWith('http') || url.startsWith('hypertro://')) {
            handleDeepLink(url)
          } else {
            // If it's just a path, navigate directly
            if (isReady()) {
              navigateToPath(url)
            } else {
              console.warn('⚠️ WebView not ready for notification navigation')
            }
          }
        }
      })

    // Cleanup listeners on unmount
    return () => {
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [authToken, handleDeepLink, isReady, navigateToPath])

  /**
   * Map deep link paths to web app routes
   */
  const mapDeepLinkToWebPath = (
    path: string,
    queryParams?: Record<string, string>,
  ) => {
    // Strip fitspace/ or trainer/ prefix for mapping lookup
    let lookupPath = path
    if (path.startsWith('fitspace/')) {
      lookupPath = path.substring('fitspace/'.length)
    } else if (path.startsWith('trainer/')) {
      lookupPath = path.substring('trainer/'.length)
    }

    // Map common deep link patterns to web routes
    const pathMappings: Record<string, string> = {
      // Profile and settings
      profile: '/fitspace/profile',
      settings: '/fitspace/settings',

      // Training
      workout: '/fitspace/workout',
      workouts: '/fitspace/workout',
      training: '/fitspace/workout',
      plans: '/fitspace/my-plans',
      'my-plans': '/fitspace/my-plans',

      // Nutrition
      nutrition: '/fitspace/meal-plans',
      meals: '/fitspace/meal-plans',
      'meal-plans': '/fitspace/meal-plans',
      'meal-plan': '/fitspace/meal-plan',

      // Progress and social
      progress: '/fitspace/progress',
      'my-trainer': '/fitspace/my-trainer',
      explore: '/fitspace/explore',
      trainers: '/fitspace/explore',

      // Trainer routes
      clients: '/trainer/clients',
      dashboard: '/trainer/dashboard',
      exercises: '/trainer/exercises',
      trainings: '/trainer/trainings',
      teams: '/trainer/teams',
      'exercises-management': '/trainer/exercises-management',
      'public-profile': '/trainer/public-profile',

      // Default
      '': '/fitspace',
      home: '/fitspace',
    }

    let webPath = pathMappings[lookupPath] || `/fitspace/${lookupPath}`

    // Handle trainer paths specifically
    if (path.startsWith('trainer/')) {
      webPath = pathMappings[lookupPath] || `/trainer/${lookupPath}`
    }

    // Add query parameters if they exist
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams)
      webPath += `?${searchParams.toString()}`
    }

    return webPath
  }

  // Check permissions status for iOS only when authenticated
  useEffect(() => {
    if (Platform.OS === 'ios' && authToken) {
      // Check permissions for authenticated iOS users
      Notifications.getPermissionsAsync().then((status) => {
        if (status.status !== 'granted') {
          console.info(
            '📱 iOS push permissions not granted yet - will request when user enables notifications',
          )
        }
      })
    }
  }, [authToken])

  return <>{children}</>
}

/**
 * Hook to manually request push notification permissions
 * Use this when you want to ask for permissions at a specific time
 */
export function useRequestPushPermissions(authToken?: string) {
  const requestPermissions = async () => {
    try {
      if (!authToken) {
        console.warn(
          '⚠️ Cannot request push permissions without authentication',
        )
        return false
      }

      const { status } = await Notifications.requestPermissionsAsync()

      if (status === 'granted') {
        // Re-initialize push notifications with new permissions
        const result = await initializePushNotifications(authToken)
        if (result) {
          Alert.alert(
            'Notifications Enabled',
            'You will now receive push notifications for workouts, meals, and updates!',
            [{ text: 'Great!', style: 'default' }],
          )
          return true
        }
      } else {
        Alert.alert(
          'Notifications Disabled',
          'To receive workout reminders and updates, please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        )
        return false
      }
    } catch (error) {
      console.error('❌ Error requesting push permissions:', error)
      return false
    }
  }

  const checkAndSyncPermissions = async () => {
    try {
      if (!authToken) return false

      const { status } = await Notifications.getPermissionsAsync()

      if (status === 'granted') {
        // Permissions are now granted, try to sync
        const result = await initializePushNotifications(authToken, true) // Force re-sync
        if (result && APP_CONFIG.IS_DEV) {
          console.info('✅ Push notifications re-synced')
        }
        return !!result
      }
      return false
    } catch (error) {
      console.error('❌ Error checking permissions:', error)
      return false
    }
  }

  const disableNotifications = async () => {
    try {
      if (!authToken) {
        console.warn(
          '⚠️ Cannot disable push notifications without authentication',
        )
        return false
      }

      const result = await disablePushNotifications(authToken)
      if (result) {
        Alert.alert(
          'Notifications Disabled',
          'Push notifications have been disabled. You can re-enable them anytime in settings.',
          [{ text: 'OK', style: 'default' }],
        )
        return true
      } else {
        Alert.alert(
          'Error',
          'Failed to disable push notifications. Please try again.',
          [{ text: 'OK', style: 'default' }],
        )
        return false
      }
    } catch (error) {
      console.error('❌ Error disabling push notifications:', error)
      Alert.alert(
        'Error',
        'Failed to disable push notifications. Please try again.',
        [{ text: 'OK', style: 'default' }],
      )
      return false
    }
  }

  const getCurrentToken = () => {
    return getCurrentPushToken()
  }

  return {
    requestPermissions,
    checkAndSyncPermissions,
    disableNotifications,
    getCurrentToken,
  }
}
