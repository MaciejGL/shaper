/**
 * Bulletproof deep link utilities for Hypro mobile app
 * Handles URL generation and ensures consistent format across the entire web app
 */

/**
 * Create a properly formatted deep link
 * Generates hypertro://?url=<encoded absolute web url>
 */
export function createDeepLink(
  path: string,
  queryParams?: Record<string, string>,
): string {
  const webUrl = createWebUrl(path, queryParams)
  const deepLink = `hypertro://?url=${encodeURIComponent(webUrl)}`
  console.info('🔗 Generated deep link:', deepLink)
  return deepLink
}

/**
 * Safe navigation to deep link with fallback
 * Handles both native app detection and web fallback
 */
export function navigateToDeepLink(
  path: string,
  queryParams?: Record<string, string>,
  fallbackUrl?: string,
) {
  // Prefer scheme with URL param for robust routing through index route
  const webUrl = createWebUrl(path, queryParams)
  const encoded = encodeURIComponent(webUrl)
  const deepLink = `hypertro://?url=${encoded}`

  try {
    // Try deep link first
    window.location.href = deepLink

    // Fallback to web app after delay if provided
    if (fallbackUrl) {
      setTimeout(() => {
        console.info('⏰ Fallback triggered, navigating to:', fallbackUrl)
        window.location.href = fallbackUrl
      }, 1000)
    }
  } catch (error) {
    console.error('❌ Deep link navigation failed:', error)
    // Immediate fallback on error
    if (fallbackUrl) {
      console.info('🔄 Using immediate fallback:', fallbackUrl)
      window.location.href = fallbackUrl
    }
  }
}

/**
 * Helper to create web fallback URL
 */
export function createWebUrl(
  path: string,
  queryParams?: Record<string, string>,
): string {
  // Guard against SSR
  if (typeof window === 'undefined') {
    // Fallback for server-side (shouldn't happen, but safe)
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams)
      return `${cleanPath}?${searchParams.toString()}`
    }
    return cleanPath
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  let url = `${window.location.origin}${cleanPath}`

  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams)
    url += `?${searchParams.toString()}`
  }

  return url
}

/**
 * Complete navigation helper - handles both deep link and web fallback
 */
export function navigateToPath(
  path: string,
  queryParams?: Record<string, string>,
) {
  const webUrl = createWebUrl(path, queryParams)
  navigateToDeepLink(path, queryParams, webUrl)
}

/**
 * Fire-and-forget attempt to open the native app without web fallback.
 * Use this when you also trigger SPA navigation via Next.js to avoid full reloads.
 */
export function tryOpenAppDeepLink(
  path: string,
  queryParams?: Record<string, string>,
) {
  const webUrl = createWebUrl(path, queryParams)
  const deepLink = `hypertro://?url=${encodeURIComponent(webUrl)}`

  // Defer so it doesn't interfere with current click/navigation handlers
  setTimeout(() => {
    try {
      window.location.href = deepLink
    } catch {
      // No-op: this is best-effort only
    }
  }, 0)
}
