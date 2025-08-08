import Constants from 'expo-constants'
import React from 'react'
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

export default function HypertroWebView() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        source={{ uri: 'https://fit-space.app' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        userAgent="HypertroApp/1.0 (Expo)"
        injectedJavaScript={`
          window.isNativeApp = true;
          window.platform = 'expo';
          console.log('Hypertro WebView loaded!');
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
