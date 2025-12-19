/**
 * Complete Hypro Mobile App with Push Notifications and Deep Linking
 * Enhanced for bulletproof user switching
 * This component integrates all the functionality together
 */
import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { APP_CONFIG } from '../config/app-config'
import { useAndroidBackButton } from '../hooks/use-android-back-button'
import { useAuthTokenManagement } from '../hooks/use-auth-token-management'
import { usePushNotificationSync } from '../hooks/use-push-notification-sync'
import { useThemeManager } from '../hooks/use-theme-manager'
import { initAlternativeBilling } from '../services/alternative-billing'

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

/**
 * Convert relative or custom scheme URLs to full HTTPS URLs
 */
const convertToFullUrl = (url: string): string => {
  if (url.startsWith('exp://')) {
    console.log('🔗 Ignoring exp:// deep link in WebView context:', url)
    // return exactly from exp://... to the WebView
    return ``
  }
  // Already a full URL
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url
  }

  // Relative path - convert to full URL
  if (url.startsWith('/')) {
    return `${APP_CONFIG.WEB_URL}${url}`
  }

  // Custom schemes - convert to HTTPS
  if (url.startsWith('hypro://') || url.startsWith('hypertro://')) {
    const path = url.replace(/^(hypro|hypertro):\/\//, '')
    return `${APP_CONFIG.WEB_URL}/${path}`
  }

  // Fallback - assume it needs web URL prefix
  return `${APP_CONFIG.WEB_URL}/${url}`
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
  const [currentUrl, setCurrentUrl] = useState<string>('')

  // Determine bottom bar color based on current URL
  const isFitspaceRoute = currentUrl.includes('/fitspace')
  const bottomBarColor = isFitspaceRoute
    ? colors.appBackground
    : colors.statusBarBackground

  const contentEdges = Platform.select({
    android: ['left', 'right', 'bottom'] as const,
    default: ['left', 'right'] as const,
  })

  // Handle navigation state changes to track current URL
  const handleNavigationStateChange = (navState: any) => {
    if (navState.url) {
      setCurrentUrl(navState.url)
    }
  }

  // Initialize External Offers (Android only) and check for initial URL
  useEffect(() => {
    // Initialize External Offers for Google Play compliance
    initAlternativeBilling()

    const checkInitialUrl = async () => {
      try {
        // Check for deep link URL
        const linkUrl = await Linking.getInitialURL()

        // Check for notification URL (cold start with notification tap)
        const notificationResponse =
          await Notifications.getLastNotificationResponse()
        const notificationUrl = notificationResponse?.notification.request
          .content.data?.url as string | undefined

        // Priority: notification URL > deep link URL
        const url = notificationUrl || linkUrl

        if (url) {
          const fullUrl = convertToFullUrl(url)
          setInitialUrl(fullUrl)
        }
      } catch (error) {
        console.error('❌ Error checking initial URL:', error)
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
      <View style={styles.container}>
        <StatusBar
          style={colors.statusBarStyle}
          backgroundColor={colors.statusBarBackground}
        />
        <SafeAreaView
          style={{ backgroundColor: colors.statusBarBackground }}
          edges={['top']}
        />
        <SafeAreaView
          style={[styles.content, { backgroundColor: bottomBarColor }]}
          edges={contentEdges}
        >
          <EnhancedWebView
            ref={webViewRef}
            initialUrl={initialUrl}
            onThemeChange={handleWebThemeChange}
            onAuthToken={handleAuthToken}
            onRequestPushPermission={requestPermissions}
            onCheckPushPermissions={checkAndSyncPermissions}
            onDisablePushPermissions={disableNotifications}
            onNavigationStateChange={handleNavigationStateChange}
          />
        </SafeAreaView>
      </View>
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
  content: {
    flex: 1,
  },
})

export default HyproApp
