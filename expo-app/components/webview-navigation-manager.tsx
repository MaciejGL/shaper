/**
 * WebView Navigation Manager
 * Provides a context for managing WebView navigation from push notifications and deep links
 */
import React, { ReactNode, createContext, useContext, useRef } from 'react'

import { EnhancedWebViewRef } from './enhanced-webview'

interface WebViewNavigationContextType {
  webViewRef: React.RefObject<EnhancedWebViewRef | null>
  navigateToPath: (path: string) => void
  isReady: () => boolean
}

const WebViewNavigationContext =
  createContext<WebViewNavigationContextType | null>(null)

interface WebViewNavigationProviderProps {
  children: ReactNode
}

export function WebViewNavigationProvider({
  children,
}: WebViewNavigationProviderProps) {
  const webViewRef = useRef<EnhancedWebViewRef>(null)

  const navigateToPath = (path: string) => {
    if (webViewRef.current) {
      webViewRef.current.navigateToPath(path)
    } else {
      console.warn('⚠️ WebView not ready for navigation to:', path)
    }
  }

  const isReady = () => {
    return webViewRef.current !== null
  }

  const value: WebViewNavigationContextType = {
    webViewRef,
    navigateToPath,
    isReady,
  }

  return (
    <WebViewNavigationContext.Provider value={value}>
      {children}
    </WebViewNavigationContext.Provider>
  )
}

export function useWebViewNavigation() {
  const context = useContext(WebViewNavigationContext)
  if (!context) {
    throw new Error(
      'useWebViewNavigation must be used within a WebViewNavigationProvider',
    )
  }
  return context
}
