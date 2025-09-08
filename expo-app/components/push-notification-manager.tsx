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
 * Bulletproof URL normalization for deep links
 * Handles all known malformed URL patterns from iOS/Android/WebView
 */
function normalizeDeepLink(url: string): string {
  if (!url) return url

  let normalized = url.trim()

  // Fix multiple slash patterns
  normalized = normalized
    .replace(/hypertro:\/{3,}/g, 'hypertro://') // hypertro:/// -> hypertro://
    .replace(/hypertro:\/{1}([^\/])/g, 'hypertro://$1') // hypertro:/path -> hypertro://path

  // Ensure double slash after scheme if missing
  if (
    normalized.startsWith('hypertro:') &&
    !normalized.startsWith('hypertro://')
  ) {
    normalized = normalized.replace('hypertro:', 'hypertro://')
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
        // ✅ BULLETPROOF: Normalize URL first
        const normalizedUrl = normalizeDeepLink(url)

        if (normalizedUrl !== url) {
          console.info('🔧 URL normalized:', url, '->', normalizedUrl)
        }

        // Parse the normalized URL
        const parsed = Linking.parse(normalizedUrl)
        console.info('🔗 Parsed deep link:', parsed)

        // Handle different URL schemes
        if (
          normalizedUrl.includes('hypertro.app') ||
          normalizedUrl.startsWith('hypertro://')
        ) {
          // This is a Hypertro deep link
          let targetPath = parsed.path || '/'

          // Clean up the path
          if (targetPath.startsWith('/')) {
            targetPath = targetPath.substring(1)
          }

          // Check if this is a path we should handle (fitspace/ or trainer/ or custom scheme)
          const shouldHandle =
            normalizedUrl.startsWith('hypertro://') ||
            targetPath.startsWith('fitspace/') ||
            targetPath.startsWith('trainer/')

          if (!shouldHandle) {
            console.info(
              '❌ Deep link ignored (not fitspace/trainer path):',
              normalizedUrl,
            )
            return
          }

          // Map deep link paths to web app routes
          const webPath = mapDeepLinkToWebPath(
            targetPath,
            parsed.queryParams as Record<string, string> | undefined,
          )

          console.info('✅ Navigating to web path:', webPath)

          // Actually navigate the WebView to the target path
          if (isReady()) {
            navigateToPath(webPath)
          } else {
            console.warn('⚠️ WebView not ready, queuing navigation for later')
            // Retry navigation after a short delay
            setTimeout(() => {
              if (isReady()) {
                navigateToPath(webPath)
              } else {
                console.error('❌ WebView still not ready, skipping navigation')
              }
            }, 1000)
          }
        } else {
          console.info(
            '❌ Deep link ignored (not Hypertro URL):',
            normalizedUrl,
          )
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

  useEffect(() => {
    // Only initialize push notifications when user is authenticated
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

    // Set up deep linking listener
    const handleUrl = (event: { url: string }) => {
      handleDeepLink(event.url)
    }

    // Listen for incoming deep links
    const linkingSubscription = Linking.addEventListener('url', handleUrl)
    linkingListener.current = () => linkingSubscription?.remove?.()

    // Handle deep link if app was opened via URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url)
      }
    })

    // Cleanup listeners on unmount
    return () => {
      if (responseListener.current) {
        responseListener.current.remove()
      }
      if (linkingListener.current) {
        linkingListener.current()
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
