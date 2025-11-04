'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

interface MobileOAuthTriggerProps {
  callbackUrl: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds between retries

/**
 * Mobile OAuth Trigger (Client Component)
 *
 * Automatically triggers Google OAuth with multiple retry attempts.
 */
export function MobileOAuthTrigger({ callbackUrl }: MobileOAuthTriggerProps) {
  const [showManualButton, setShowManualButton] = useState(false)
  const [isManualLoading, setIsManualLoading] = useState(false)
  const hasTriggered = useRef(false)
  const isRedirecting = useRef(false)

  const triggerOAuth = async () => {
    // Prevent multiple simultaneous redirects
    if (isRedirecting.current) return
    isRedirecting.current = true

    // Redirect directly to Google OAuth endpoint
    // This bypasses the custom signIn page to avoid showing the login form
    window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
  }

  const handleManualTrigger = async () => {
    setIsManualLoading(true)
    await triggerOAuth()
  }

  useEffect(() => {
    // Prevent double-mounting in React Strict Mode
    if (hasTriggered.current) return
    hasTriggered.current = true

    let currentAttempt = 0

    const attemptOAuth = async () => {
      // If we've already successfully redirected, stop
      if (isRedirecting.current && currentAttempt > 0) return

      currentAttempt++

      await triggerOAuth()

      // If still on this page after attempting, schedule retry
      if (currentAttempt < MAX_RETRIES) {
        setTimeout(() => {
          // Only retry if we're still on this page (didn't redirect)
          if (
            !isRedirecting.current ||
            document.visibilityState === 'visible'
          ) {
            isRedirecting.current = false // Reset for retry
            attemptOAuth()
          }
        }, RETRY_DELAY)
      } else {
        // All retries exhausted, show manual button
        setShowManualButton(true)
      }
    }

    // Start first attempt after short delay (500ms to let page load)
    const initialTimer = setTimeout(() => {
      attemptOAuth()
    }, 500)

    return () => {
      clearTimeout(initialTimer)
    }
  }, [callbackUrl])

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo
        size={80}
        infinite={!showManualButton}
        forceColor="text-white"
      />

      <div className="mt-6 text-center flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold text-white">
          {showManualButton
            ? 'Waiting for Google Sign-In...'
            : 'Starting Google Sign-In...'}
        </h1>
        <p className="text-sm text-zinc-400 animate-pulse">
          {showManualButton
            ? 'Not redirecting automatically?'
            : 'Redirecting to Google'}
        </p>

        {showManualButton && (
          <Button
            onClick={handleManualTrigger}
            loading={isManualLoading}
            size="lg"
            className="mt-4"
          >
            Start Google Sign-In
          </Button>
        )}
      </div>
    </div>
  )
}
