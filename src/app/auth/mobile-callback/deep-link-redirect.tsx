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

    console.info('📱 [DEEP-LINK-REDIRECT] Creating deep link:', {
      callbackUrl,
      deepLink,
      hasSessionToken: callbackUrl.includes('session_token'),
      encodedUrl: encodeURIComponent(callbackUrl),
    })

    // Trigger deep link immediately
    window.location.href = deepLink

    console.info('📱 [DEEP-LINK-REDIRECT] Deep link triggered')
  }, [callbackUrl])

  return null
}
