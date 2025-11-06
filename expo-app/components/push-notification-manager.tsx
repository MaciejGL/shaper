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
   * Helper to wait for WebView readiness before navigating
   */
  const waitForWebViewThenNavigate = useCallback(
    (url: string) => {
      const attemptNavigation = (attempt = 1) => {
        if (isReady()) {
          navigateToPath(url)
        } else if (attempt < 10) {
          setTimeout(() => attemptNavigation(attempt + 1), 300 * attempt)
        }
      }
      attemptNavigation()
    },
    [isReady, navigateToPath],
  )

  /**
   * Handle deep linking - navigate to specific parts of the app
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      try {
        // Parse URL to check for special cases
        const parsed = Linking.parse(url)
        const oauthCode = parsed.queryParams?.oauth_code as string | undefined

        // 1. OAuth handoff flow (has oauth_code param)
        if (oauthCode) {
          const next =
            (parsed.queryParams?.next as string) || '/fitspace/workout'
          const exchangeUrl = `${APP_CONFIG.WEB_URL}/api/mobile-auth/exchange?code=${oauthCode}&next=${encodeURIComponent(next)}`
          waitForWebViewThenNavigate(exchangeUrl)
          return
        }

        // 2. Associated links (HTTPS URLs) - forward directly to WebView
        if (url.startsWith('https://')) {
          waitForWebViewThenNavigate(url)
          return
        }

        // 3. Relative paths (from push notifications) - convert to full URL
        if (url.startsWith('/')) {
          const fullUrl = `${APP_CONFIG.WEB_URL}${url}`
          console.info('📱 [PUSH] Notification URL:', fullUrl)
          waitForWebViewThenNavigate(fullUrl)
          return
        }

        // 4. Custom schemes (hypro://, hypertro://) - convert to HTTPS
        if (url.startsWith('hypro://') || url.startsWith('hypertro://')) {
          const path = url.replace(/^(hypro|hypertro):\/\//, '')
          const httpsUrl = `${APP_CONFIG.WEB_URL}/${path}`
          waitForWebViewThenNavigate(httpsUrl)
          return
        }

        // 5. Fallback - try to navigate anyway
        console.warn('⚠️ Unknown URL format, attempting navigation:', url)
        waitForWebViewThenNavigate(url)
      } catch (error) {
        console.error('❌ Error handling deep link:', error, 'URL:', url)
      }
    },
    [waitForWebViewThenNavigate],
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

    // Note: Cold start deep link handling is now done in hypertro-app.tsx
    // to properly convert URLs before passing to WebView initialUrl

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
        const url = response.notification.request.content.data?.url as
          | string
          | undefined
        if (url) {
          handleDeepLink(url)
        }
      })

    // Cleanup listeners on unmount
    return () => {
      if (responseListener.current) {
        responseListener.current.remove()
      }
    }
  }, [authToken, handleDeepLink, isReady, navigateToPath])

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
