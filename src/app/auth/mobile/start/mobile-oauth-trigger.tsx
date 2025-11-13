'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

interface MobileOAuthTriggerProps {
  callbackUrl: string
}

/**
 * Mobile OAuth Trigger (Client Component)
 *
 * Shows a button to initiate Google OAuth. User interaction is REQUIRED to prevent
 * mobile browsers (Safari ITP) from blocking cookies. Auto-redirects from external
 * apps are treated as tracking attempts and cause OAuth state verification to fail.
 *
 * This bypasses the custom signIn page and goes directly to Google OAuth.
 */
export function MobileOAuthTrigger({ callbackUrl }: MobileOAuthTriggerProps) {
  const [showManualButton, setShowManualButton] = useState(false)
  const [isManualLoading, setIsManualLoading] = useState(false)
  const hasTriggered = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const triggerOAuth = async () => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    await signIn('google', {
      callbackUrl: callbackUrl,
      redirect: true,
    })
  }

  const handleManualTrigger = () => {
    setIsManualLoading(true)
    triggerOAuth()
  }

  useEffect(() => {
    // Programmatically click the button after a short delay
    // This simulates user interaction, bypassing ITP restrictions
    // The browser sees a button click event, which allows cookies to be set
    const autoClickTimer = setTimeout(() => {
      if (buttonRef.current && !hasTriggered.current) {
        buttonRef.current.click()
      }
    }, 700)

    // Show fallback button after 3 seconds if auto-click didn't work
    const fallbackTimer = setTimeout(() => {
      if (!hasTriggered.current) {
        console.warn(
          '🔐 [MOBILE-OAUTH] Auto-click did not trigger, showing manual button',
        )
        setShowManualButton(true)
      }
    }, 3000)

    return () => {
      clearTimeout(autoClickTimer)
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

      <div className="mt-6 text-center flex flex-col items-center gap-4 max-w-md">
        <h1 className="text-xl font-semibold text-white">
          {showManualButton
            ? 'Continue to Google'
            : 'Starting Google Sign-In...'}
        </h1>
        <p className="text-sm text-zinc-400">
          {showManualButton
            ? 'Tap the button below to sign in with your Google account'
            : 'Redirecting to Google'}
        </p>

        {/* Hidden button for programmatic click */}
        <button
          ref={buttonRef}
          onClick={handleManualTrigger}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Visible fallback button */}
        {showManualButton && (
          <Button
            onClick={handleManualTrigger}
            loading={isManualLoading}
            size="lg"
            className="mt-4"
          >
            Continue with Google
          </Button>
        )}
      </div>
    </div>
  )
}
