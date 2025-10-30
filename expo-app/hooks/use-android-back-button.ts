/**
 * Hook to handle Android back button navigation
 */
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

import { EnhancedWebViewRef } from '../components/enhanced-webview'

export function useAndroidBackButton(
  webViewRef: React.RefObject<EnhancedWebViewRef | null>,
) {
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
}
