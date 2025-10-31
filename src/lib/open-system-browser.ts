/**
 * Utility to open URLs in system browser (not WebView)
 *
 * This is specifically for native app scenarios where we want to force
 * the URL to open in the device's default browser instead of the WebView.
 */

/**
 * Opens a URL in the system browser (not WebView)
 *
 * Uses multiple fallback methods to ensure the system browser opens:
 * 1. window.open() with appropriate flags
 * 2. Link element click as fallback
 *
 * NOTE: Does NOT use window.location.href fallback as that would
 * navigate the WebView instead of opening an external browser.
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

    // Method 1: Try window.open()
    const windowRef = window.open(absoluteUrl, '_blank', 'noopener,noreferrer')

    if (!windowRef) {
      console.warn(
        '🌐 [SYSTEM-BROWSER] window.open returned null, trying link element',
      )

      // Method 2: Fallback to link element click
      const link = document.createElement('a')
      link.href = absoluteUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
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
