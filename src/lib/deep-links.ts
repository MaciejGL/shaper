/**
 * Bulletproof deep link utilities for Hypertro mobile app
 * Handles URL generation and ensures consistent format across the entire web app
 */

/**
 * Create a properly formatted deep link
 * Always generates hypertro://path format (double slashes)
 */
export function createDeepLink(
  path: string,
  queryParams?: Record<string, string>,
): string {
  // Clean the path - remove leading slash if present
  let cleanPath = path.startsWith('/') ? path.substring(1) : path

  // Ensure path doesn't start with extra slashes
  cleanPath = cleanPath.replace(/^\/+/, '')

  // Ensure path is not empty (default to fitspace)
  if (!cleanPath || cleanPath === '/') {
    cleanPath = 'fitspace'
  }

  // Build base deep link with exactly double slashes
  let deepLink = `hypertro://${cleanPath}`

  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams)
    deepLink += `?${searchParams.toString()}`
  }

  // 🛡️ BULLETPROOF: Validate and fix any malformed URLs
  deepLink = deepLink.replace(/hypertro:\/{3,}/g, 'hypertro://') // Fix triple+ slashes
  deepLink = deepLink.replace(/hypertro:\/{1}([^\/])/g, 'hypertro://$1') // Fix single slash

  // Final validation - ensure it starts with exactly hypertro://
  if (!deepLink.startsWith('hypertro://')) {
    const pathPart = deepLink.replace(/^hypertro:\/*/g, '')
    deepLink = `hypertro://${pathPart}`
  }

  // 🔍 DEBUG: Log what we're generating
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
  const deepLink = createDeepLink(path, queryParams)

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
