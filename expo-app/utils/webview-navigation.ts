/**
 * WebView Navigation Utilities
 *
 * Handles URL filtering and navigation control for the WebView.
 */

/**
 * Determines if a WebView should load a given URL.
 *
 * Deep link URLs (hypro://, hypertro://) are blocked from loading in the WebView
 * because they're handled by the native deep link handler (PushNotificationManager).
 *
 * @param url - The URL the WebView is attempting to load
 * @returns true to allow loading, false to block
 */
export function shouldLoadUrlInWebView(url: string): boolean {
  // Block deep link schemes - these are handled by native layer
  const deepLinkSchemes = ['hypro://', 'hypertro://']

  for (const scheme of deepLinkSchemes) {
    if (url.startsWith(scheme)) {
      console.info(
        '🚫 [WEBVIEW-NAV] Blocked deep link from loading in WebView:',
        url.substring(0, 50) + '...',
      )
      return false
    }
  }

  // Allow all HTTPS/HTTP URLs
  return true
}
