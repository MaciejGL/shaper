'use client'

import { useEffect, useRef, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

interface MobileOAuthTriggerProps {
  callbackUrl: string
}

/**
 * Mobile OAuth Trigger (Client Component)
 *
 * Automatically redirects to Google OAuth, bypassing the custom sign-in page.
 * Shows a fallback button if redirect doesn't happen within 5 seconds.
 */
export function MobileOAuthTrigger({ callbackUrl }: MobileOAuthTriggerProps) {
  const [showManualButton, setShowManualButton] = useState(false)
  const [isManualLoading, setIsManualLoading] = useState(false)
  const hasTriggered = useRef(false)

  const triggerOAuth = () => {
    // Prevent multiple simultaneous redirects
    if (hasTriggered.current) return
    hasTriggered.current = true

    // Redirect directly to NextAuth's Google OAuth endpoint
    // This bypasses the custom signIn page configured in authOptions.pages.signIn
    // and goes straight to /api/auth/signin/google which initiates OAuth flow
    const oauthUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`

    console.log('🔐 [MOBILE-OAUTH] Redirecting to Google OAuth:', {
      oauthUrl,
      callbackUrl,
      currentOrigin: window.location.origin,
      currentHref: window.location.href,
    })

    window.location.href = oauthUrl
  }

  const handleManualTrigger = () => {
    setIsManualLoading(true)
    triggerOAuth()
  }

  useEffect(() => {
    // Prevent double-mounting in React Strict Mode
    if (hasTriggered.current) return

    // Trigger OAuth immediately when component mounts
    // Small delay allows the loading UI to render first
    const redirectTimer = setTimeout(() => {
      triggerOAuth()
    }, 5000)

    // Show fallback manual button if redirect doesn't happen within 5 seconds
    // This handles edge cases where redirect might be blocked or slow
    const fallbackTimer = setTimeout(() => {
      if (!hasTriggered.current) {
        console.warn(
          '🔐 [MOBILE-OAUTH] Automatic redirect did not complete, showing manual button',
        )
        setShowManualButton(true)
      }
    }, 10000)

    return () => {
      clearTimeout(redirectTimer)
      clearTimeout(fallbackTimer)
    }
  }, [callbackUrl])

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo
        size={80}
        infinite={!showManualButton}
        forceColor="text-white"
      />
      <pre>
        {JSON.stringify({
          oauthUrl: `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          callbackUrl,
          currentOrigin: window.location.origin,
          currentHref: window.location.href,
        })}
      </pre>

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
