'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

/**
 * Login Auth Overlay
 *
 * Shows a loading overlay during OAuth flow completion.
 * Detects when user returns from system browser after OAuth.
 */
export function LoginAuthOverlay() {
  const { status } = useSession()
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    // Check if OAuth flow is in progress
    const oauthInProgress = sessionStorage.getItem('oauth_in_progress') === 'true'

    if (oauthInProgress) {
      console.info('🔐 [AUTH-OVERLAY] OAuth in progress, showing overlay')
      setShowOverlay(true)

      // If session becomes authenticated, clear flag and hide overlay
      if (status === 'authenticated') {
        console.info('🔐 [AUTH-OVERLAY] Session authenticated, hiding overlay')
        sessionStorage.removeItem('oauth_in_progress')
        setShowOverlay(false)
      }
    }
  }, [status])

  if (!showOverlay) {
    return null
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <AnimatedLogo size={80} infinite={true} forceColor="text-white" />
        <h2 className="text-xl font-semibold text-white">Completing Sign In...</h2>
        <p className="text-sm text-zinc-400 animate-pulse">Just a moment</p>
      </div>
    </div>
  )
}

