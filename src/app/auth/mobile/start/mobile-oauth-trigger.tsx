'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

interface MobileOAuthTriggerProps {
  callbackUrl: string
}

/**
 * Mobile OAuth Trigger (Client Component)
 *
 * Automatically triggers Google OAuth sign-in using NextAuth's signIn() function.
 * Includes fallback to direct navigation if signIn() fails.
 */
export function MobileOAuthTrigger({ callbackUrl }: MobileOAuthTriggerProps) {
  const [error, setError] = useState<string | null>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    // Prevent double-mounting in React Strict Mode
    if (hasTriggered.current) return
    hasTriggered.current = true

    // Small delay to ensure SessionProvider is ready
    const timer = setTimeout(async () => {
      try {
        // Use NextAuth's official signIn function
        const result = await signIn('google', {
          callbackUrl,
          redirect: true,
        })

        // Fallback: Direct navigation if signIn doesn't redirect
        if (result?.error) {
          window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
        }
      } catch (err) {
        // Fallback: Direct navigation
        window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [callbackUrl])

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
