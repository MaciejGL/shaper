/**
 * Complete Hypro Mobile App with Push Notifications and Deep Linking
 * Enhanced for bulletproof user switching
 * This component integrates all the functionality together
 */
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAndroidBackButton } from '../hooks/use-android-back-button'
import { useAuthTokenManagement } from '../hooks/use-auth-token-management'
import { usePushNotificationSync } from '../hooks/use-push-notification-sync'
import { useThemeManager } from '../hooks/use-theme-manager'

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

function HyproAppContent({ authToken }: HyproAppProps) {
  const { webViewRef } = useWebViewNavigation()
  const { handleWebThemeChange, colors } = useThemeManager()

  const { currentAuthToken, handleAuthToken } =
    useAuthTokenManagement(authToken)
  const { requestPermissions, checkAndSyncPermissions, disableNotifications } =
    useRequestPushPermissions(currentAuthToken)

  usePushNotificationSync(currentAuthToken, checkAndSyncPermissions)
  useAndroidBackButton(webViewRef)

  // State for initial URL detection (cold start with notification)
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined)
  const [isCheckingInitialUrl, setIsCheckingInitialUrl] = useState(true)

  // Check for initial URL from notification on cold start
  useEffect(() => {
    const checkInitialUrl = async () => {
      try {
        // Check for deep link URL
        const linkUrl = await Linking.getInitialURL()
        console.info('📱 [COLD-START] Checking for initial URL...')
        console.info('📱 [COLD-START] Deep link URL:', linkUrl || 'none')

        // Check for notification URL (cold start with notification tap)
        const notificationResponse =
          await Notifications.getLastNotificationResponse()
        const notificationUrl = notificationResponse?.notification.request
          .content.data?.url as string | undefined

        console.info(
          '📱 [COLD-START] Notification URL:',
          notificationUrl || 'none',
        )

        // Priority: notification URL > deep link URL
        const url = notificationUrl || linkUrl

        if (url) {
          console.info('📱 [COLD-START] Initial URL detected:', url)
          setInitialUrl(url)
        } else {
          console.info('📱 [COLD-START] No initial URL, using default')
        }
      } catch (error) {
        console.error('❌ [COLD-START] Error checking initial URL:', error)
      } finally {
        setIsCheckingInitialUrl(false)
      }
    }

    checkInitialUrl()
  }, [])

  // Wait until we've checked for initial URL before rendering WebView
  if (isCheckingInitialUrl) {
    return null
  }

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
          initialUrl={initialUrl}
          onThemeChange={handleWebThemeChange}
          onAuthToken={handleAuthToken}
          onRequestPushPermission={requestPermissions}
          onCheckPushPermissions={checkAndSyncPermissions}
          onDisablePushPermissions={disableNotifications}
        />
      </SafeAreaView>
    </PushNotificationManager>
  )
}

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
