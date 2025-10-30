'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

/**
 * Mobile OAuth Trigger Component
 *
 * Automatically triggers Google OAuth when mounted.
 * This runs in the system browser after the user clicks "Continue with Google" in the app.
 */
export function MobileOAuthTrigger({ callbackUrl }: { callbackUrl: string }) {
  useEffect(() => {
    console.info('🔐 [MOBILE-OAUTH-TRIGGER] Auto-triggering Google OAuth:', {
      callbackUrl,
    })

    // Auto-trigger Google sign-in
    signIn('google', {
      callbackUrl,
      redirect: true,
    })
  }, [callbackUrl])

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Starting Google Sign-In...
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Redirecting to Google...
      </p>
    </div>
  )
}
