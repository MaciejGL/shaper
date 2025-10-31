'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

/**
 * Mobile OAuth Trigger Component
 *
 * Automatically triggers Google OAuth when mounted.
 * This runs in the system browser after the user clicks "Continue with Google" in the app.
 */
export function MobileOAuthTrigger({ callbackUrl }: { callbackUrl: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Prevent double-trigger in React Strict Mode
    if (mounted) {
      return
    }

    setMounted(true)

    // Wait 1 second for everything to settle (URLs, query params, page load, etc.)
    const timer = setTimeout(() => {
      signIn('google', {
        callbackUrl,
        redirect: true,
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [callbackUrl, mounted])

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
