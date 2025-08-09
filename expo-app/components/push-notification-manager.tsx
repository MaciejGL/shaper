/**
 * Push Notification Manager for Mobile App
 * Handles push notification registration and deep linking
 */
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import React, { useCallback, useEffect, useRef } from 'react'
import { Alert, Platform } from 'react-native'

import { initializePushNotifications } from '../services/push-notifications'

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
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)
  const linkingListener = useRef<(() => void) | null>(null)
  const { navigateToPath, isReady } = useWebViewNavigation()

  /**
   * Handle deep linking - navigate to specific parts of the app
   */
  const handleDeepLink = useCallback(
    (url: string) => {
      try {
        // Parse the URL
        const parsed = Linking.parse(url)
        console.info('🔗 Parsed deep link:', parsed)

        // Handle different URL schemes
        if (url.includes('hypertro.app') || url.startsWith('hypertro://')) {
          // This is a Hypertro deep link
          let targetPath = parsed.path || '/'

          // Clean up the path
          if (targetPath.startsWith('/')) {
            targetPath = targetPath.substring(1)
          }

          // Map deep link paths to web app routes
          const webPath = mapDeepLinkToWebPath(
            targetPath,
            parsed.queryParams as Record<string, string> | undefined,
          )

          console.info('🔗 Navigating to web path:', webPath)

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
        }
      } catch (error) {
        console.error('❌ Error handling deep link:', error)
      }
    },
    [isReady, navigateToPath],
  )

  useEffect(() => {
    // Initialize push notifications
    initializePushNotifications(authToken).then((result) => {
      if (result) {
        console.info('✅ Push notifications initialized successfully')
      } else {
        console.warn('⚠️ Failed to initialize push notifications')
      }
    })

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.info('📱 Notification received:', notification)

        // You can show custom UI here if needed
        // For now, we'll let the system handle it
      })

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
      if (notificationListener.current) {
        notificationListener.current.remove()
      }
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
    // Map common deep link patterns to web routes
    const pathMappings: Record<string, string> = {
      // Profile and settings
      profile: '/fitspace/profile',
      settings: '/fitspace/settings',

      // Training
      workouts: '/fitspace/workouts',
      plans: '/fitspace/my-plans',
      training: '/fitspace/workouts',

      // Nutrition
      nutrition: '/fitspace/nutrition',
      meals: '/fitspace/nutrition',

      // Social
      trainers: '/fitspace/trainers',
      clients: '/trainer/clients',

      // Default
      '': '/fitspace',
      home: '/fitspace',
    }

    let webPath = pathMappings[path] || `/fitspace/${path}`

    // Add query parameters if they exist
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams)
      webPath += `?${searchParams.toString()}`
    }

    return webPath
  }

  // Request permissions on first render for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Request permissions for iOS
      Notifications.getPermissionsAsync().then((status) => {
        if (status.status !== 'granted') {
          // Don't request immediately - let the user experience the app first
          // You can add a prompt later asking if they want notifications
          console.info('📱 iOS push permissions not granted yet')
        }
      })
    }
  }, [])

  return <>{children}</>
}

/**
 * Hook to manually request push notification permissions
 * Use this when you want to ask for permissions at a specific time
 */
export function useRequestPushPermissions() {
  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync()

      if (status === 'granted') {
        // Re-initialize push notifications with new permissions
        const result = await initializePushNotifications()
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

  return { requestPermissions }
}
