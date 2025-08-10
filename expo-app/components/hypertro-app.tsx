/**
 * Complete Hypertro Mobile App with Push Notifications and Deep Linking
 * This component integrates all the functionality together
 */
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { AppState, SafeAreaView, StyleSheet } from 'react-native'

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

interface HypertroAppProps {
  authToken?: string
}

// Inner component that has access to WebView navigation context
function HypertroAppContent({ authToken }: HypertroAppProps) {
  const { webViewRef } = useWebViewNavigation()
  const { handleWebThemeChange, colors } = useThemeManager()
  const [currentAuthToken, setCurrentAuthToken] = React.useState(authToken)
  const { requestPermissions, checkAndSyncPermissions, disableNotifications } =
    useRequestPushPermissions(currentAuthToken)

  const handleAuthToken = (token: string) => {
    console.info(
      '📱 Received auth token from web app:',
      token.slice(0, 10) + '...',
    )
    setCurrentAuthToken(token)
  }

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
export function HypertroApp({ authToken }: HypertroAppProps) {
  return (
    <WebViewNavigationProvider>
      <HypertroAppContent authToken={authToken} />
    </WebViewNavigationProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
})

export default HypertroApp
