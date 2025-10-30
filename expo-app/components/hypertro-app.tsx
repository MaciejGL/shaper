/**
 * Complete Hypro Mobile App with Push Notifications and Deep Linking
 * Enhanced for bulletproof user switching
 * This component integrates all the functionality together
 */
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { AppState, BackHandler, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemeManager } from '../hooks/use-theme-manager'
import {
  resetForUserSwitch,
  resetPushNotificationState,
} from '../services/push-notifications'

import { EnhancedWebView } from './enhanced-webview'
import {
  PushNotificationManager,
  useRequestPushPermissions,
} from './push-notification-manager'
import {
  WebViewNavigationProvider,
  useWebViewNavigation,
} from './webview-navigation-manager'

interface HyproAppProps {
  authToken?: string
}

// Inner component that has access to WebView navigation context
function HyproAppContent({ authToken }: HyproAppProps) {
  const { webViewRef } = useWebViewNavigation()
  const { handleWebThemeChange, colors } = useThemeManager()
  const [currentAuthToken, setCurrentAuthToken] = useState(authToken)
  const { requestPermissions, checkAndSyncPermissions, disableNotifications } =
    useRequestPushPermissions(currentAuthToken)

  const handleAuthToken = (token: string) => {
    console.info(
      '📱 Received auth token from web app:',
      token.slice(0, 10) + '...',
    )

    // Extract user ID for comparison (more robust than full token comparison)
    const newUserId = token.split(':')[1] || token.slice(0, 50)
    const currentUserId =
      currentAuthToken?.split(':')[1] || currentAuthToken?.slice(0, 50)

    // If this is a different user, reset push notification state
    if (currentAuthToken && currentUserId !== newUserId) {
      console.info(
        '📱 Different user detected, resetting push notification state',
      )
      // Use enhanced reset function for user switching
      resetForUserSwitch(token).catch((error) => {
        console.warn('⚠️ Error during user switch reset:', error)
        // Fallback to basic reset if enhanced reset fails
        resetPushNotificationState()
      })
    }

    setCurrentAuthToken(token)
  }

  // Reset push notification state when user logs out
  useEffect(() => {
    if (!currentAuthToken) {
      console.info('📱 User logged out, resetting push notification state')
      resetPushNotificationState()
    }
  }, [currentAuthToken])

  // Monitor app state changes to detect when user enables permissions externally
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number | null = null

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && currentAuthToken) {
        // Debounce app state changes to prevent excessive calls
        if (timeoutId) clearTimeout(timeoutId)

        timeoutId = setTimeout(() => {
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

  const handleRequestPushPermission = () => {
    requestPermissions()
  }

  const handleCheckPushPermissions = () => {
    checkAndSyncPermissions()
  }

  const handleDisablePushNotifications = () => {
    disableNotifications()
  }

  const [initialWebUrl, setInitialWebUrl] = useState<string | undefined>(
    undefined,
  )

  // Handle Android back button - let WebView handle history (including URL-based modal state)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Simply navigate back in WebView history
        // URL-based modal state will handle closing modals automatically
        if (webViewRef.current?.goBack) {
          webViewRef.current.goBack()
          return true // Prevent default app exit
        }
        // If WebView ref not ready, allow default behavior
        return false
      },
    )

    return () => backHandler.remove()
  }, [webViewRef])

  useEffect(() => {
    // Only handle push notifications here - deep links are handled by PushNotificationManager
    const checkNotificationNavigation = async () => {
      const lastNotificationResponse =
        await Notifications.getLastNotificationResponse()
      if (lastNotificationResponse?.notification.request.content.data?.url) {
        const notificationUrl = lastNotificationResponse.notification.request
          .content.data.url as string
        console.info(
          '📱 App opened from notification, navigating to:',
          notificationUrl,
        )
        // Ensure we use the full URL with domain to prevent default redirects
        const fullNotificationUrl = notificationUrl.startsWith('http')
          ? notificationUrl
          : `https://www.hypro.app${notificationUrl.startsWith('/') ? '' : '/'}${notificationUrl}`
        setInitialWebUrl(fullNotificationUrl)
      }
    }

    checkNotificationNavigation()
  }, [])

  return (
    <PushNotificationManager authToken={currentAuthToken}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.appBackground }]}
      >
        <StatusBar
          style={colors.statusBarStyle}
          backgroundColor={colors.statusBarBackground}
        />
        <EnhancedWebView
          ref={webViewRef}
          initialUrl={initialWebUrl}
          onThemeChange={handleWebThemeChange}
          onAuthToken={handleAuthToken}
          onRequestPushPermission={handleRequestPushPermission}
          onCheckPushPermissions={handleCheckPushPermissions}
          onDisablePushPermissions={handleDisablePushNotifications}
        />
      </SafeAreaView>
    </PushNotificationManager>
  )
}

// Main app component with providers
export function HyproApp({ authToken }: HyproAppProps) {
  return (
    <WebViewNavigationProvider>
      <HyproAppContent authToken={authToken} />
    </WebViewNavigationProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default HyproApp
