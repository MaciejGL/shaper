'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'

/**
 * Login Auth Overlay
 *
 * Shows a loading overlay when OAuth completes and returns to the app.
 * - success=true: Shows when OAuth completes and session is being established
 */
export function LoginAuthOverlay() {
  const { status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    const authSuccess = searchParams?.get('success') === 'true'

    // Show overlay only when user returns from successful OAuth
    if (authSuccess) {
      setShowOverlay(true)

      // If session becomes authenticated, hide overlay and redirect
      if (status === 'authenticated') {
        router.push('/fitspace/workout')
      }
    }
  }, [status, router, searchParams])

  // Aggressively poll for session when OAuth completes
  useEffect(() => {
    const authSuccess = searchParams?.get('success') === 'true'

    if (authSuccess && status !== 'authenticated') {
      // Trigger immediate session check
      update()

      // Poll every 300ms for faster session detection
      const interval = setInterval(() => {
        update()
      }, 300)

      return () => clearInterval(interval)
    }
  }, [searchParams, status, update])

  if (!showOverlay) {
    return null
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <AnimatedLogo size={80} infinite={true} forceColor="text-white" />
        <h2 className="text-xl font-semibold text-white">Signing in...</h2>
      </div>
    </div>
  )
}
