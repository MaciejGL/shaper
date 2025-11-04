'use client'

import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

interface MobileCompleteRedirectProps {
  redirectUrl: string
  userId: string
  email: string
}

/**
 * Client-side deep link redirect
 *
 * Next.js server-side redirect() doesn't work with custom URL schemes (hypro://)
 * We need to use client-side window.location to trigger the deep link.
 *
 * Redirects immediately with fallback to manual button if deep link fails.
 */
export function MobileCompleteRedirect({
  redirectUrl,
  userId,
  email,
}: MobileCompleteRedirectProps) {
  const [showManualButton, setShowManualButton] = useState(false)

  useEffect(() => {
    // Trigger deep link immediately
    window.location.href = redirectUrl

    // If user is still on this page after 3 seconds, show manual button
    // This handles cases where the deep link doesn't work (app not installed, etc.)
    const fallbackTimer = setTimeout(() => {
      setShowManualButton(true)
    }, 3000)

    // Try to auto-close the browser tab after 2 seconds
    // This works if the deep link successfully opened the app
    const closeTimer = setTimeout(() => {
      window.close()
    }, 2000)

    return () => {
      clearTimeout(fallbackTimer)
      clearTimeout(closeTimer)
    }
  }, [redirectUrl, userId, email])

  const handleManualOpen = () => {
    console.info('🔐 [MOBILE-REDIRECT] Manual button clicked')
    window.location.href = redirectUrl
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={!showManualButton} />

      {!showManualButton ? (
        <>
          <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
            Authentication Successful!
          </h1>
          <p className="text-sm text-muted-foreground animate-pulse">
            Returning to app...
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
            Almost Done!
          </h1>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            If the app didn't open automatically,
            <br />
            click the button below.
          </p>
          <Button onClick={handleManualOpen} size="lg">
            Open App
          </Button>
          <p className="text-xs text-muted-foreground/60 mt-4">
            You can close this browser tab after opening the app
          </p>
        </>
      )}
    </div>
  )
}
