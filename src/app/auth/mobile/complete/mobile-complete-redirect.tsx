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
 * Client-side deep link redirect with countdown and retry
 *
 * Next.js server-side redirect() doesn't work with custom URL schemes (hypro://)
 * We need to use client-side window.location to trigger the deep link.
 */
export function MobileCompleteRedirect({
  redirectUrl,
  userId,
  email,
}: MobileCompleteRedirectProps) {
  const [countdown, setCountdown] = useState(3)
  const [retries, setRetries] = useState(0)
  const [showManualButton, setShowManualButton] = useState(false)
  const [showCloseMessage, setShowCloseMessage] = useState(false)

  useEffect(() => {
    console.info('🔐 [MOBILE-REDIRECT] Preparing deep link:', {
      redirectUrl,
      userId,
      email,
      countdown,
      retries,
    })

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Countdown reached 0, trigger deep link
      console.info(
        '🔐 [MOBILE-REDIRECT] Triggering deep link attempt:',
        retries + 1,
      )
      window.location.href = redirectUrl

      // Retry logic if needed
      if (retries < 2) {
        setTimeout(() => {
          console.warn('🔐 [MOBILE-REDIRECT] Retrying deep link...')
          setRetries(retries + 1)
          setCountdown(1) // Try again after 1 second
        }, 1000)
      } else {
        // All retries exhausted, show manual button
        setTimeout(() => {
          console.error(
            '🔐 [MOBILE-REDIRECT] All retries failed, showing manual button',
          )
          setShowManualButton(true)
        }, 1000)

        // Try to auto-close browser tab after deep link triggered
        setTimeout(() => {
          window.close()

          // If window.close() doesn't work, show message
          // Check if tab is still visible after attempting to close
          setTimeout(() => {
            if (!document.hidden) {
              setShowCloseMessage(true)
            }
          }, 500)
        }, 2000)
      }
    }
  }, [countdown, retries, redirectUrl, userId, email])

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
          <p className="text-lg text-muted-foreground mt-2">
            Redirecting in {countdown}...
          </p>
          {retries > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-2">
              Retry attempt {retries + 1}/3
            </p>
          )}
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
            Almost Done!
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {showCloseMessage
              ? 'You can close this tab and return to the app.'
              : 'Click the button below to open the app.'}
          </p>
          <Button onClick={handleManualOpen} size="lg">
            Open App
          </Button>
          {showCloseMessage && (
            <p className="text-xs text-muted-foreground/60 mt-4">
              ✓ You may close this browser tab
            </p>
          )}
        </>
      )}
    </div>
  )
}
