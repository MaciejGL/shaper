'use client'

import { useEffect, useState } from 'react'

interface DeepLinkRedirectProps {
  callbackUrl: string
}

/**
 * Client component that triggers deep link to return to mobile app
 */
export function DeepLinkRedirect({ callbackUrl }: DeepLinkRedirectProps) {
  const [showManualButton, setShowManualButton] = useState(false)
  const deepLink = `hypertro://?url=${encodeURIComponent(callbackUrl)}`

  useEffect(() => {
    console.info('📱 [DEEP-LINK-REDIRECT] Creating deep link:', {
      callbackUrl,
      deepLink,
      hasSessionToken: callbackUrl.includes('session_token'),
      encodedUrl: encodeURIComponent(callbackUrl),
    })

    // Add delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      console.info('📱 [DEEP-LINK-REDIRECT] Attempting to trigger deep link...')

      // Try multiple methods to trigger deep link
      // Method 1: Direct location change
      window.location.href = deepLink

      // Method 2: Create invisible iframe (fallback)
      setTimeout(() => {
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = deepLink
        document.body.appendChild(iframe)

        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 100)
      }, 100)

      console.info('📱 [DEEP-LINK-REDIRECT] Deep link triggered')

      // Show manual button after 2 seconds if still on page
      setTimeout(() => {
        setShowManualButton(true)
      }, 2000)
    }, 500)

    return () => clearTimeout(timer)
  }, [callbackUrl, deepLink])

  const handleManualOpen = () => {
    console.info('📱 [DEEP-LINK-REDIRECT] Manual button clicked')
    window.location.href = deepLink
  }

  if (!showManualButton) {
    return null
  }

  return (
    <button
      onClick={handleManualOpen}
      className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
    >
      Open Hypro App
    </button>
  )
}
