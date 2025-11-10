/**
 * Enhanced WebView with Push Notifications and Deep Linking
 * Replaces basic WebView with full functionality
 */
import { useNetInfo } from '@react-native-community/netinfo'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as SplashScreen from 'expo-splash-screen'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

import { APP_CONFIG } from '../config/app-config'
import { shouldLoadUrlInWebView } from '../utils/webview-navigation'

import { OfflineScreen } from './offline-screen'

/**
 * Creates clean, readable injected JavaScript for the WebView
 */
function createWebViewScript(): string {
  return `
    ${setupNativeAppGlobals()}
    ${setupNativeAppAPI()}
    ${setupNavigationMonitoring()}
    ${setupThemeDetection()}
    ${setupHistoryOverrides()}
    
    console.log('✅ ${APP_CONFIG.APP_NAME} Enhanced WebView loaded!');
    true; // Required return statement
  `
}

/**
 * Setup global variables to identify native app environment
 */
function setupNativeAppGlobals(): string {
  return `
    // Make app aware it's running in native container
    window.isNativeApp = true;
    window.mobilePlatform = '${Platform.OS}';
    window.appEnvironment = '${APP_CONFIG.ENVIRONMENT}';
  `
}

/**
 * Setup native app API for web-to-native communication
 */
function setupNativeAppAPI(): string {
  return `
    // Native app capabilities exposed to web app
    window.nativeApp = {
      // Navigation communication
      onNavigate: function(path) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'navigation',
          path: path
        }));
      },
      
      // Notification handling
      handleNotificationClick: function(data) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'notification_click',
          data: data
        }));
      },
      
      // Permission requests
      requestNotificationPermission: function() {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'request_push_permission'
        }));
      },
      
      // Check and sync permissions (for when user enables in settings)
      checkNotificationPermissions: function() {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'check_push_permissions'
        }));
      },
      
      // Disable push notifications (updates backend)
      disableNotificationPermissions: function() {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'disable_push_permissions'
        }));
      },
      
      // Theme synchronization
      updateTheme: function(theme) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'theme_changed',
          theme: theme
        }));
      },
      
      // Authentication bridge
      setAuthToken: function(token) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'auth_token',
          token: token
        }));
      },
      
      // Open external URL in system browser (iOS)
      openExternalUrl: function(url) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'open_external_url',
          url: url
        }));
      },
      
      // Download file via native bridge
      downloadFile: function(data) {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'download_file',
          data: data
        }));
      }
    };
  `
}

/**
 * Setup navigation change monitoring
 */
function setupNavigationMonitoring(): string {
  return `
    // Track navigation changes and notify native app
    let currentPath = window.location.pathname;
    
    // Event-based navigation monitoring (more efficient than polling)
    const handleNavigationChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        window.nativeApp?.onNavigate(currentPath);
      }
    };
    
    // Listen for browser navigation events
    window.addEventListener('popstate', handleNavigationChange);
    
    // Fallback polling with reduced frequency (every 5 seconds instead of 3)
    setInterval(handleNavigationChange, 5000);
  `
}

/**
 * Setup comprehensive theme detection and monitoring
 */
function setupThemeDetection(): string {
  return `
    // Theme detection and monitoring system
    let currentTheme = null;
    
    const detectTheme = () => {
      // Method 1: Check for dark mode CSS classes
      const isDarkClass = document.documentElement.classList.contains('dark') || 
                        document.body.classList.contains('dark') ||
                        document.querySelector('[data-theme="dark"]') !== null;
      
      // Method 2: Check CSS custom properties and background color
      const rootStyles = getComputedStyle(document.documentElement);
      const bgColor = rootStyles.getPropertyValue('--background') || rootStyles.backgroundColor;
      const isDarkBg = bgColor && (
        bgColor.includes('rgb(0') || 
        bgColor.includes('#000') || 
        bgColor.includes('hsl(0')
      );
      
      // Method 3: Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const hasLightClass = document.documentElement.classList.contains('light');
      
      // Determine theme (prioritize explicit classes over inference)
      let detectedTheme = 'light';
      if (isDarkClass) {
        detectedTheme = 'dark';
      } else if (isDarkBg) {
        detectedTheme = 'dark';
      } else if (prefersDark && !hasLightClass) {
        detectedTheme = 'dark';
      }
      
      // Notify native app if theme changed
      if (detectedTheme !== currentTheme) {
        currentTheme = detectedTheme;
        window.nativeApp?.updateTheme(detectedTheme);
      }
    };
    
    // Initial theme detection (delayed to allow DOM to settle)
    setTimeout(detectTheme, 1000);
    
    // Periodic theme monitoring (reduced frequency for better performance)
    setInterval(detectTheme, 10000);
    
    // Watch for DOM changes that might indicate theme changes
    const themeObserver = new MutationObserver(detectTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
      childList: false,
      subtree: false
    });
    
    // Listen for system theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectTheme);
  `
}

/**
 * Setup browser history API overrides to catch programmatic navigation
 */
function setupHistoryOverrides(): string {
  return `
    // Override browser history methods to catch programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => window.nativeApp?.onNavigate(window.location.pathname), 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => window.nativeApp?.onNavigate(window.location.pathname), 100);
    };
  `
}

async function handleFileDownload(data: {
  base64Data: string
  filename: string
  mimeType: string
}) {
  try {
    const binaryString = atob(data.base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const file = new FileSystem.File(FileSystem.Paths.document, data.filename)
    const writer = file.writableStream().getWriter()
    await writer.write(bytes)
    await writer.close()

    await Sharing.shareAsync(file.uri, {
      UTI: data.mimeType,
      mimeType: data.mimeType,
    })
  } catch (error) {
    Alert.alert(
      'Download Failed',
      'Could not download the file. Please try again.',
      [{ text: 'OK' }],
    )
  }
}

export interface EnhancedWebViewRef {
  navigateToPath: (path: string) => void
  reload: () => void
  goBack: () => void
  goForward: () => void
}

interface EnhancedWebViewProps {
  initialUrl?: string
  onNavigationStateChange?: (navState: object) => void
  onLoad?: () => void
  onThemeChange?: (theme: 'light' | 'dark') => void
  onAuthToken?: (token: string) => void
  onRequestPushPermission?: () => void
  onCheckPushPermissions?: () => void
  onDisablePushPermissions?: () => void
}

export const EnhancedWebView = forwardRef<
  EnhancedWebViewRef,
  EnhancedWebViewProps
>(
  (
    {
      initialUrl,
      onNavigationStateChange,
      onLoad,
      onThemeChange,
      onAuthToken,
      onRequestPushPermission,
      onCheckPushPermissions,
      onDisablePushPermissions,
    },
    ref,
  ) => {
    const webViewRef = useRef<WebView>(null)
    const [showOfflineScreen, setShowOfflineScreen] = useState(false)

    // Prevent infinite loops with debouncing and refs
    const lastConnectionState = useRef<boolean | null>(null)
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isRetryingRef = useRef(false)
    const retryAttemptsRef = useRef(0)

    // Network connectivity monitoring
    const netInfo = useNetInfo()

    // Check if we should show offline screen (with loop prevention)
    React.useEffect(() => {
      // Prevent rapid network state changes from causing loops
      if (lastConnectionState.current === netInfo.isConnected) {
        return // No change, prevent unnecessary updates
      }

      lastConnectionState.current = netInfo.isConnected

      if (netInfo.isConnected === false) {
        // Clear any pending retry when going offline
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }
        isRetryingRef.current = false
        retryAttemptsRef.current = 0 // Reset retry attempts when going offline
        setShowOfflineScreen(true)
      } else if (
        netInfo.isConnected === true &&
        showOfflineScreen &&
        !isRetryingRef.current
      ) {
        // Connection restored - debounce the retry to prevent loops
        isRetryingRef.current = true
        setShowOfflineScreen(false)

        // Exponential backoff retry to prevent immediate reload loops
        const backoffDelay = Math.min(
          1000 * Math.pow(2, retryAttemptsRef.current),
          10000,
        ) // Max 10 seconds
        retryTimeoutRef.current = setTimeout(() => {
          if (netInfo.isConnected && isRetryingRef.current) {
            retryAttemptsRef.current += 1
            handleRetry()
          }
          isRetryingRef.current = false
          retryTimeoutRef.current = null
        }, backoffDelay)
      }
    }, [netInfo.isConnected]) // ❌ Removed showOfflineScreen from deps to prevent loops

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      navigateToPath: (path: string) => {
        const target = JSON.stringify(path)
        const hasSessionToken = path.includes('session_token')
        const isExchangeEndpoint = path.includes('/api/mobile-auth/exchange')

        webViewRef.current?.injectJavaScript(`
          (function() {
            try {
              const target = ${target};
              const hasSessionToken = ${hasSessionToken};
              const isExchangeEndpoint = ${isExchangeEndpoint};
              
              // If URL contains session_token OR is exchange endpoint, ALWAYS do full navigation
              // This ensures the page loads fresh and server can set cookies
              if (hasSessionToken || isExchangeEndpoint) {
                console.log('🔄 [NAVIGATION] Full navigation for:', target);
                window.location.href = target;
                return true;
              }
              
              const isAbsolute = /^https?:\/\//i.test(target);
              if (isAbsolute) {
                // If absolute URL is same-origin, use History API, else full navigation
                const targetUrl = new URL(target);
                const currentOrigin = window.location.origin;
                if (targetUrl.origin === currentOrigin && window.history && window.history.pushState) {
                  const fullPath = targetUrl.pathname + targetUrl.search + targetUrl.hash;
                  window.history.pushState(null, '', fullPath);
                  const event = new PopStateEvent('popstate', { state: null });
                  window.dispatchEvent(event);
                } else {
                  window.location.href = target;
                }
              } else {
                // Relative path navigation within the same origin
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', target);
                  const event = new PopStateEvent('popstate', { state: null });
                  window.dispatchEvent(event);
                } else {
                  window.location.href = target;
                }
              }
            } catch (e) {
              console.error('Navigation error:', e);
            }
            true;
          })();
        `)
      },

      reload: () => {
        webViewRef.current?.reload()
      },

      goBack: () => {
        webViewRef.current?.goBack()
      },

      goForward: () => {
        webViewRef.current?.goForward()
      },
    }))

    // Retry connection handler with loop prevention
    const handleRetry = React.useCallback(() => {
      if (isRetryingRef.current || !webViewRef.current) {
        return // Prevent multiple retries or retry when ref is null
      }

      console.log(
        `🔄 Retrying WebView connection... (attempt ${retryAttemptsRef.current + 1})`,
      )
      webViewRef.current.reload()
    }, [])

    // Cleanup timeouts on unmount
    React.useEffect(() => {
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        isRetryingRef.current = false
        retryAttemptsRef.current = 0 // Reset retry attempts on unmount
      }
    }, [])

    // Handle webview load - hide splash screen
    const handleLoad = React.useCallback(() => {
      SplashScreen.hideAsync()
      onLoad?.()
    }, [onLoad])

    // Generate the injected JavaScript in a clean, readable way
    const injectedJavaScript = createWebViewScript()

    const handleMessage = (event: { nativeEvent: { data: string } }) => {
      try {
        const message = JSON.parse(event.nativeEvent.data)

        switch (message.type) {
          case 'navigation':
            onNavigationStateChange?.(message)
            break

          case 'notification_click':
            // Handle notification clicks from web app
            break

          case 'request_push_permission':
            onRequestPushPermission?.()
            break

          case 'check_push_permissions':
            onCheckPushPermissions?.()
            break

          case 'disable_push_permissions':
            onDisablePushPermissions?.()
            break

          case 'theme_changed':
            onThemeChange?.(message.theme)
            break

          case 'auth_token':
            onAuthToken?.(message.token)
            break

          case 'open_external_url':
            Linking.openURL(message.url).catch((err) => {
              console.error('Failed to open URL:', err)
            })
            break

          case 'download_file':
            handleFileDownload(message.data).catch((err) => {
              console.error('File download failed:', err)
            })
            break

          default:
            // Unknown message from web app
            break
        }
      } catch (error) {
        console.error('❌ Error parsing message from web app:', error)
      }
    }

    // Enhanced error handler with loop prevention
    const handleWebViewError = React.useCallback(
      (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent
        console.error('❌ WebView error:', nativeEvent)

        // Only show offline screen if we're not already showing it (prevent loops)
        if (!showOfflineScreen && netInfo.isConnected === false) {
          const isNetworkError =
            nativeEvent.description?.includes(
              'Kunne ikke koble til tjeneren',
            ) ||
            nativeEvent.description?.includes(
              'Could not connect to the server',
            ) ||
            nativeEvent.description?.includes(
              'net::ERR_INTERNET_DISCONNECTED',
            ) ||
            nativeEvent.description?.includes('net::ERR_NETWORK_CHANGED') ||
            nativeEvent.description?.includes('net::ERR_NETWORK_IO_SUSPENDED')

          if (isNetworkError) {
            console.log('🌐 Network error detected, showing offline screen')
            setShowOfflineScreen(true)
          }
        }
      },
      [netInfo.isConnected, showOfflineScreen],
    )

    // Enhanced load end handler with loop prevention
    const handleLoadEnd = React.useCallback(
      (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent
        isRetryingRef.current = false // Reset retry flag when load completes

        // Only show offline screen if not already showing (prevent loops)
        if (
          !showOfflineScreen &&
          !nativeEvent.loading &&
          nativeEvent.canGoBack === false &&
          nativeEvent.canGoForward === false &&
          nativeEvent.title === '' &&
          netInfo.isConnected === false
        ) {
          console.warn(
            '⚠️ WebView loaded but appears to have connection issues',
          )
          setShowOfflineScreen(true)
        }
      },
      [netInfo.isConnected, showOfflineScreen],
    )

    // Show offline screen when no connection
    if (showOfflineScreen) {
      return <OfflineScreen onRetry={handleRetry} />
    }

    console.log('[INITIAL URL]', initialUrl)

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{
            uri: initialUrl || `${APP_CONFIG.WEB_URL}/fitspace/workout`,
          }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          userAgent={APP_CONFIG.USER_AGENT}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          onNavigationStateChange={onNavigationStateChange}
          onLoad={handleLoad}
          onError={handleWebViewError}
          onShouldStartLoadWithRequest={(request) =>
            shouldLoadUrlInWebView(request.url)
          }
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.error(
              '❌ WebView HTTP error:',
              nativeEvent.statusCode,
              nativeEvent.description,
            )
          }}
          onLoadEnd={handleLoadEnd}
          // Security settings
          allowsBackForwardNavigationGestures={true}
          decelerationRate={0.998}
          // Enable features needed for web app
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Cache and storage optimizations
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          // Performance optimizations
          androidLayerType="hardware"
          mixedContentMode="compatibility"
          allowsFullscreenVideo={false}
          allowsProtectedMedia={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
})

EnhancedWebView.displayName = 'EnhancedWebView'
