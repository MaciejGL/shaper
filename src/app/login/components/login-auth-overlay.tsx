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
  const [showOverlay, setShowOverlay] = useState(() => {
    // Initialize state immediately from sessionStorage
    const oauthInProgress =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('oauth_in_progress') === 'true'
        : false

    return oauthInProgress
  })

  useEffect(() => {
    // Check if OAuth flow is in progress
    const oauthInProgress =
      sessionStorage.getItem('oauth_in_progress') === 'true'

    if (oauthInProgress) {
      setShowOverlay(true)

      // If session becomes authenticated, clear flag and hide overlay
      if (status === 'authenticated') {
        sessionStorage.removeItem('oauth_in_progress')
        setShowOverlay(false)
      }
    } else {
      setShowOverlay(false)
    }
  }, [status])

  // Trigger immediate and frequent session checks when OAuth is in progress
  const { update } = useSession()
  useEffect(() => {
    const oauthInProgress =
      sessionStorage.getItem('oauth_in_progress') === 'true'
    if (oauthInProgress) {
      // Trigger immediately
      update()

      // Poll every 500ms for faster session detection
      const interval = setInterval(() => {
        update()
      }, 500)

      return () => {
        clearInterval(interval)
      }
    }
  }, [update])

  if (!showOverlay) {
    return null
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <AnimatedLogo size={80} infinite={true} forceColor="text-white" />
        <h2 className="text-xl font-semibold text-white">
          Completing Sign In...
        </h2>
        <p className="text-sm text-zinc-400 animate-pulse">Just a moment</p>
      </div>
    </div>
  )
}
