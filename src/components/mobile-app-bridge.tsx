/**
 * Mobile App Bridge - Single Source of Truth
 *
 * This is the ONLY file you need for mobile app integration.
 * Provides React hooks and utilities for web app to interact with mobile app.
 *
 * Features:
 * - Detect if running in mobile app
 * - Request push notification permissions
 * - Auto-sync auth tokens
 * - Navigate within mobile app
 * - Theme synchronization
 * - Ready-to-use UI components
 *
 * Quick Usage:
 * ```tsx
 * import { useMobileApp } from '@/components/mobile-app-bridge'
 *
 * function Settings() {
 *   const { isNativeApp, requestPushPermissions } = useMobileApp()
 *
 *   return isNativeApp ? (
 *     <button onClick={requestPushPermissions}>Enable Notifications</button>
 *   ) : (
 *     <p>Download our mobile app!</p>
 *   )
 * }
 * ```
 */
import { useEffect, useRef, useState } from 'react'

/**
 * Convert a Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      // Remove the data:*/*;base64, prefix
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

interface NativeAppAPI {
  onNavigate: (path: string) => void
  handleNotificationClick: (data: Record<string, unknown>) => void
  requestNotificationPermission: () => void
  checkNotificationPermissions: () => void
  disableNotificationPermissions: () => void
  updateTheme: (theme: 'light' | 'dark') => void
  setAuthToken: (token: string) => void
  openExternalUrl: (url: string) => void
  downloadFile: (data: {
    base64Data: string
    filename: string
    mimeType: string
  }) => void
  getExternalOfferToken: () => Promise<
    | string
    | null
    | {
        token: string | null
        diagnostics: {
          isInitialized: boolean
          isAvailable: boolean | null
          errorName: string | null
        }
      }
  >
  openExternalCheckout: (url: string) => void
}

declare global {
  interface Window {
    isNativeApp?: boolean
    mobilePlatform?: 'ios' | 'android' | 'expo' | 'web'
    appEnvironment?: string
    nativeApp?: NativeAppAPI
    __externalOfferDiagnostics?: {
      isInitialized: boolean
      isAvailable: boolean | null
      errorName: string | null
    } | null
  }
}

export function useMobileApp() {
  const [isNativeApp, setIsNativeApp] = useState(false)
  const [platform, setPlatform] = useState<
    'ios' | 'android' | 'expo' | 'web' | undefined
  >()
  const initRef = useRef(false)

  const derivedIsNativeApp =
    isNativeApp ||
    (typeof window !== 'undefined' &&
      (window.isNativeApp === true || !!window.nativeApp))
  const derivedPlatform =
    platform ||
    (typeof window !== 'undefined' ? window.mobilePlatform : undefined)

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initRef.current) return
    initRef.current = true

    // Check if running in native app
    const isNative = window.isNativeApp === true || !!window.nativeApp
    const currentPlatform = window.mobilePlatform

    setIsNativeApp(isNative)
    setPlatform(currentPlatform)

    if (isNative) {
      console.info('🚀 Mobile app bridge initialized', {
        platform: currentPlatform,
        environment: window.appEnvironment,
      })
    }

    // Cleanup function
    return () => {
      initRef.current = false
    }
  }, [])

  /**
   * Request push notification permissions
   * Shows native permission dialog if user hasn't been asked before,
   * or opens device settings if permissions were previously denied
   */
  const requestPushPermissions = () => {
    if (derivedIsNativeApp && window.nativeApp?.requestNotificationPermission) {
      console.info(
        '📱 Requesting push notification permissions from native app',
      )
      window.nativeApp.requestNotificationPermission()
    } else {
      console.warn(
        '⚠️ Push notification request not available (not running in native app)',
      )
    }
  }

  /**
   * Check and sync push notification permissions
   * Useful when user might have enabled permissions in device settings
   */
  const checkPushPermissions = () => {
    if (derivedIsNativeApp && window.nativeApp?.checkNotificationPermissions) {
      console.info('📱 Checking push notification permissions status')
      window.nativeApp.checkNotificationPermissions()
    } else {
      console.warn(
        '⚠️ Push notification check not available (not running in native app)',
      )
    }
  }

  /**
   * Disable push notification permissions
   * This will update the backend to disable the push token
   */
  const disablePushPermissions = () => {
    if (
      derivedIsNativeApp &&
      window.nativeApp?.disableNotificationPermissions
    ) {
      console.info('📱 Disabling push notification permissions')
      window.nativeApp.disableNotificationPermissions()
    } else {
      console.warn(
        '⚠️ Push notification disable not available (not running in native app)',
      )
    }
  }

  /**
   * Navigate to a specific path in the app
   */
  const navigateToPath = (path: string) => {
    if (derivedIsNativeApp && window.nativeApp?.onNavigate) {
      window.nativeApp.onNavigate(path)
    }
  }

  /**
   * Update the app theme (for status bar/navigation bar styling)
   */
  const updateTheme = (theme: 'light' | 'dark') => {
    if (derivedIsNativeApp && window.nativeApp?.updateTheme) {
      window.nativeApp.updateTheme(theme)
    }
  }

  /**
   * Send authentication token to native app
   * This enables push notification registration for the authenticated user
   */
  const setAuthToken = (token: string) => {
    if (derivedIsNativeApp && window.nativeApp?.setAuthToken) {
      console.info('📱 Sending auth token to native app')
      window.nativeApp.setAuthToken(token)
    }
  }

  const openExternalUrl = (url: string) => {
    if (
      derivedIsNativeApp &&
      derivedPlatform === 'ios' &&
      window.nativeApp?.openExternalUrl
    ) {
      window.nativeApp.openExternalUrl(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const downloadFile = async (
    blob: Blob,
    filename: string,
    mimeType: string,
  ) => {
    if (!derivedIsNativeApp || !window.nativeApp?.downloadFile) {
      return
    }

    const base64Data = await blobToBase64(blob)
    window.nativeApp.downloadFile({
      base64Data,
      filename,
      mimeType,
    })
  }

  /**
   * Get external offer token for Google Play External Offers compliance (Android only)
   * Returns null on iOS/web or if not available
   */
  const getExternalOfferToken = async (): Promise<{
    token: string | null
    diagnostics: {
      isInitialized: boolean
      isAvailable: boolean | null
      errorName: string | null
    } | null
  }> => {
    const isNativeNow =
      typeof window !== 'undefined' &&
      (window.isNativeApp === true || !!window.nativeApp)
    const platformNow =
      typeof window !== 'undefined' ? window.mobilePlatform : undefined

    if (!isNativeNow || platformNow !== 'android') {
      window.__externalOfferDiagnostics = null
      return { token: null, diagnostics: null }
    }
    if (!window.nativeApp?.getExternalOfferToken) {
      window.__externalOfferDiagnostics = null
      return { token: null, diagnostics: null }
    }
    try {
      const result = await window.nativeApp.getExternalOfferToken()
      if (typeof result === 'string' || result === null) {
        window.__externalOfferDiagnostics = null
        return { token: result, diagnostics: null }
      }

      if (
        typeof result === 'object' &&
        result !== null &&
        'token' in result &&
        'diagnostics' in result
      ) {
        const token =
          typeof result.token === 'string' || result.token === null
            ? result.token
            : null
        const diagnostics =
          typeof result.diagnostics === 'object' && result.diagnostics !== null
            ? {
                isInitialized: !!result.diagnostics.isInitialized,
                isAvailable:
                  typeof result.diagnostics.isAvailable === 'boolean'
                    ? result.diagnostics.isAvailable
                    : null,
                errorName:
                  typeof result.diagnostics.errorName === 'string'
                    ? result.diagnostics.errorName
                    : null,
              }
            : null
        window.__externalOfferDiagnostics = diagnostics
        return { token, diagnostics }
      }

      window.__externalOfferDiagnostics = null
      return { token: null, diagnostics: null }
    } catch (error) {
      console.error('Failed to get external offer token:', error)
      window.__externalOfferDiagnostics = null
      return { token: null, diagnostics: null }
    }
  }

  /**
   * Open checkout URL in Custom Tabs (Android) or Safari (iOS)
   * Falls back to regular window.location for web
   */
  const openExternalCheckout = (url: string) => {
    const isNativeNow =
      typeof window !== 'undefined' &&
      (window.isNativeApp === true || !!window.nativeApp)
    if (isNativeNow && window.nativeApp?.openExternalCheckout) {
      window.nativeApp.openExternalCheckout(url)
    } else {
      window.location.href = url
    }
  }

  /**
   * Get available capabilities in the mobile app
   */
  const getCapabilities = () => {
    const nativeAPI = derivedIsNativeApp ? window.nativeApp : null
    return {
      canRequestPushPermissions: !!nativeAPI?.requestNotificationPermission,
      canCheckPushPermissions: !!nativeAPI?.checkNotificationPermissions,
      canDisablePushPermissions: !!nativeAPI?.disableNotificationPermissions,
      canNavigate: !!nativeAPI?.onNavigate,
      canUpdateTheme: !!nativeAPI?.updateTheme,
      canSetAuthToken: !!nativeAPI?.setAuthToken,
      canOpenExternalUrl:
        !!nativeAPI?.openExternalUrl && derivedPlatform === 'ios',
      canDownloadFile: !!nativeAPI?.downloadFile,
    }
  }

  return {
    // Basic info
    isNativeApp: derivedIsNativeApp,
    platform: derivedPlatform,
    capabilities: getCapabilities(),

    // Core functions
    requestPushPermissions,
    checkPushPermissions,
    disablePushPermissions,
    navigateToPath,
    updateTheme,
    setAuthToken,
    openExternalUrl,
    downloadFile,
    getExternalOfferToken,
    openExternalCheckout,

    // Convenience functions
    isIOS: derivedPlatform === 'ios',
    isAndroid: derivedPlatform === 'android',
  }
}

/**
 * Hook to automatically send auth token to mobile app when user logs in
 */
export function useMobileAppAuth(token?: string) {
  const { setAuthToken, isNativeApp } = useMobileApp()

  useEffect(() => {
    if (isNativeApp && token) {
      setAuthToken(token)
    }
  }, [token, isNativeApp, setAuthToken])
}

/**
 * Example Settings Component
 *
 * This shows how to implement push notification settings in your web app
 * that works both in web browsers and mobile app
 */
export function PushNotificationSettings() {
  const { isNativeApp, requestPushPermissions, checkPushPermissions } =
    useMobileApp()
  const [isChecking, setIsChecking] = useState(false)

  const handleEnableNotifications = async () => {
    setIsChecking(true)
    try {
      // First check if permissions were already granted externally
      checkPushPermissions()

      // Wait a moment for the check to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Then request permissions if needed
      requestPushPermissions()
    } finally {
      setIsChecking(false)
    }
  }

  const handleCheckPermissions = () => {
    checkPushPermissions()
  }

  if (!isNativeApp) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Push notifications are only available in the mobile app.
          <a href="/download" className="underline ml-1">
            Download the app
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Push Notifications
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get notified about workouts, meals, and updates from your trainer.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleEnableNotifications}
          disabled={isChecking}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Enable Push Notifications'}
        </button>

        <button
          onClick={handleCheckPermissions}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Check Permission Status
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> If you previously denied notifications, you may
          need to enable them in your device settings. The "Check Permission
          Status" button will detect when you've enabled them externally.
        </p>
      </div>
    </div>
  )
}
