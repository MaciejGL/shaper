import Constants from 'expo-constants'
import React from 'react'
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import { APP_CONFIG } from '../config/app-config'

export default function HypertroWebView() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: APP_CONFIG.WEB_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        userAgent={APP_CONFIG.USER_AGENT}
        injectedJavaScript={`
          window.isNativeApp = true;
          window.platform = 'expo';
          window.appEnvironment = '${APP_CONFIG.ENVIRONMENT}';
          console.log('${APP_CONFIG.APP_NAME} WebView loaded!');
          true; // Required return statement
        `}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
})
