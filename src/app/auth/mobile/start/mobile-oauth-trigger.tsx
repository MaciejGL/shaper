'use client'

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
    // Redirect to NextAuth's Google provider endpoint
    // This ensures PKCE cookies are set properly before redirecting to Google
    const authUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`

    console.info('🔐 [OAUTH-TRIGGER] Redirecting to:', authUrl)

    // Use window.location.href for a full page redirect
    // This ensures NextAuth can set cookies properly
    window.location.href = authUrl
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
      <p className="text-xs text-muted-foreground/60 mt-4">
        Please wait a moment...
      </p>
    </div>
  )
}
