/**
 * Utility to open URLs in system browser (not WebView)
 *
 * This is specifically for native app scenarios where we want to force
 * the URL to open in the device's default browser instead of the WebView.
 */

/**
 * Opens a URL in the system browser (not WebView)
 *
 * Platform-specific behavior:
 * - iOS: Uses native bridge (reliable)
 * - Android: Uses JavaScript methods (already working)
 * - Web: Uses JavaScript methods (fallback)
 *
 * @param url - The URL to open (absolute or relative)
 * @returns true if opening was attempted, false if failed
 *
 * @example
 * ```tsx
 * // In a mobile app context
 * openSystemBrowser('https://example.com/auth')
 *
 * // With relative URL
 * openSystemBrowser('/auth/mobile/start')
 * ```
 */
export function openSystemBrowser(url: string): boolean {
  try {
    // Convert relative URL to absolute if needed
    const absoluteUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`

    console.info('🌐 [SYSTEM-BROWSER] Opening URL:', absoluteUrl)

    // iOS: Use native bridge (reliable on iOS)
    if (
      window.isNativeApp &&
      window.mobilePlatform === 'ios' &&
      window.nativeApp?.openExternalUrl
    ) {
      console.info('🌐 [SYSTEM-BROWSER] Using native bridge (iOS)')
      window.nativeApp.openExternalUrl(absoluteUrl)
      return true
    }

    // Android & Web: Use existing JavaScript methods (already working)
    console.info('🌐 [SYSTEM-BROWSER] Using JavaScript methods (Android/Web)')

    // Method 1: Try _system target (works on some platforms)
    let windowRef = window.open(absoluteUrl, '_system')

    if (!windowRef) {
      // Method 2: Try _blank with extended attributes
      windowRef = window.open(
        absoluteUrl,
        '_blank',
        'noopener,noreferrer,external=true',
      )
    }

    if (!windowRef) {
      // Method 3: Fallback to link element click
      const link = document.createElement('a')
      link.href = absoluteUrl
      link.target = '_blank'
      link.rel = 'external noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.info('🌐 [SYSTEM-BROWSER] Link element click triggered')
    } else {
      console.info('🌐 [SYSTEM-BROWSER] window.open succeeded')
    }

    return true
  } catch (error) {
    console.error('🌐 [SYSTEM-BROWSER] Failed to open:', error)
    return false
  }
}
