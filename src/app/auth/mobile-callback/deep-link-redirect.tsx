'use client'

import { useEffect } from 'react'

interface DeepLinkRedirectProps {
  callbackUrl: string
}

/**
 * Client component that triggers deep link to return to mobile app
 */
export function DeepLinkRedirect({ callbackUrl }: DeepLinkRedirectProps) {
  useEffect(() => {
    // Create deep link to return to mobile app
    const deepLink = `hypertro://?url=${encodeURIComponent(callbackUrl)}`

    console.info('📱 [DEEP-LINK] Redirecting to mobile app:', {
      deepLink,
      callbackUrl,
      hasSessionToken: callbackUrl.includes('session_token'),
    })

    // Trigger deep link immediately
    window.location.href = deepLink
  }, [callbackUrl])

  return null
}
