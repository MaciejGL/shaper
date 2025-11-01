'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

interface MobileOAuthTriggerProps {
  callbackUrl: string
}

/**
 * Mobile OAuth Trigger (Client Component)
 *
 * Automatically triggers Google OAuth sign-in after a brief delay.
 * This ensures the page loads fully before initiating OAuth.
 */
export function MobileOAuthTrigger({ callbackUrl }: MobileOAuthTriggerProps) {
  const [triggered, setTriggered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (triggered) return

    console.warn('🔐 [OAUTH-TRIGGER] Starting Google sign-in:', { callbackUrl })
    setTriggered(true)

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      signIn('google', {
        callbackUrl,
        redirect: true,
      }).catch((err) => {
        console.error('🔐 [OAUTH-TRIGGER] Sign-in error:', err)
        setError('Failed to start sign-in process')
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [triggered, callbackUrl])

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} forceColor="text-white" />

      {error ? (
        <div className="mt-6 text-center">
          <h1 className="text-xl font-semibold text-destructive mb-2">
            Sign-in Error
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Return to login
          </a>
        </div>
      ) : (
        <div className="mt-6 text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            Starting Google Sign-In...
          </h1>
          <p className="text-sm text-zinc-400 animate-pulse">
            Redirecting to Google
          </p>
        </div>
      )}
    </div>
  )
}
