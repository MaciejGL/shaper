'use client'

import { useEffect } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

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
 */
export function MobileCompleteRedirect({
  redirectUrl,
  userId,
  email,
}: MobileCompleteRedirectProps) {
  useEffect(() => {
    console.info('🔐 [MOBILE-REDIRECT] Triggering deep link:', {
      redirectUrl,
      userId,
      email,
    })

    // Small delay to ensure the page renders before redirect
    const timer = setTimeout(() => {
      // Try to open the deep link
      window.location.href = redirectUrl

      // Fallback: If deep link doesn't work, show error after 3 seconds
      setTimeout(() => {
        console.error(
          '🔐 [MOBILE-REDIRECT] Deep link failed to open app. User might need to manually return.',
        )
      }, 3000)
    }, 500)

    return () => clearTimeout(timer)
  }, [redirectUrl, userId, email])

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={true} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Authentication Successful!
      </h1>
      <p className="text-sm text-muted-foreground animate-pulse">
        Returning to the app...
      </p>
      <p className="text-xs text-muted-foreground/60 mt-4">
        If the app doesn't open automatically, please return manually.
      </p>
    </div>
  )
}
