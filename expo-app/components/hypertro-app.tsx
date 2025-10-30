/**
 * Complete Hypro Mobile App with Push Notifications and Deep Linking
 * Enhanced for bulletproof user switching
 * This component integrates all the functionality together
 */
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAndroidBackButton } from '../hooks/use-android-back-button'
import { useAuthTokenManagement } from '../hooks/use-auth-token-management'
import { useDeepLinkNavigation } from '../hooks/use-deep-link-navigation'
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
  const { initialWebUrl } = useDeepLinkNavigation()
  const { requestPermissions, checkAndSyncPermissions, disableNotifications } =
    useRequestPushPermissions(currentAuthToken)

  usePushNotificationSync(currentAuthToken, checkAndSyncPermissions)
  useAndroidBackButton(webViewRef)

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
