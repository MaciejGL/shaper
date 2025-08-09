/**
 * Complete Hypertro Mobile App with Push Notifications and Deep Linking
 * This component integrates all the functionality together
 */
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

import { useThemeManager } from '../hooks/use-theme-manager'

import { EnhancedWebView } from './enhanced-webview'
import { PushNotificationManager } from './push-notification-manager'
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

  return (
    <PushNotificationManager authToken={authToken}>
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
