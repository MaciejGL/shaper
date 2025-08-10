/**
 * Enhanced WebView with Push Notifications and Deep Linking
 * Replaces basic WebView with full functionality
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

import { APP_CONFIG } from '../config/app-config'

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
    window.mobilePlatform = 'expo';
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
    
    const checkForNavigation = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        window.nativeApp?.onNavigate(currentPath);
      }
    };
    
    // Poll for navigation changes every second
    setInterval(checkForNavigation, 1000);
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
    setTimeout(detectTheme, 500);
    
    // Periodic theme monitoring
    setInterval(detectTheme, 2000);
    
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

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      navigateToPath: (path: string) => {
        webViewRef.current?.injectJavaScript(`
          // Use HTML5 History API for smooth navigation
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', '${path}');
            
            // Trigger navigation in React Router or your routing system
            if (window.location.pathname !== '${path}') {
              window.location.assign('${path}');
            }
          } else {
            // Fallback for older browsers
            window.location.href = '${path}';
          }
          true; // Required return statement
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

          default:
            // Unknown message from web app
            break
        }
      } catch (error) {
        console.error('❌ Error parsing message from web app:', error)
      }
    }

    return (
      <WebView
        ref={webViewRef}
        source={{ uri: initialUrl || APP_CONFIG.WEB_URL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        userAgent={APP_CONFIG.USER_AGENT}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onNavigationStateChange={onNavigationStateChange}
        onLoad={onLoad}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error('❌ WebView error:', nativeEvent)

          // Handle specific connection errors
          if (
            nativeEvent.description?.includes(
              'Kunne ikke koble til tjeneren',
            ) ||
            nativeEvent.description?.includes('Could not connect to the server')
          ) {
            console.warn(
              '⚠️ WebView connection failed - development server may be down',
            )
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          console.error(
            '❌ WebView HTTP error:',
            nativeEvent.statusCode,
            nativeEvent.description,
          )
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent
          if (
            !nativeEvent.loading &&
            nativeEvent.canGoBack === false &&
            nativeEvent.canGoForward === false &&
            nativeEvent.title === ''
          ) {
            console.warn(
              '⚠️ WebView loaded but appears to have connection issues',
            )
          }
        }}
        // Security settings
        allowsBackForwardNavigationGestures={true}
        decelerationRate={0.998}
        // Enable features needed for your web app
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Cache and storage
        cacheEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // Performance
        androidLayerType="hardware"
      />
    )
  },
)

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
})

EnhancedWebView.displayName = 'EnhancedWebView'
