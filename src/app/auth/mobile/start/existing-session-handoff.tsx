'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { Button } from '@/components/ui/button'

interface ExistingSessionHandoffProps {
  userName: string
  callbackUrl: string
}

/**
 * Shows when user is already logged in browser
 * Allows them to continue with current account or sign out to use different one
 */
export function ExistingSessionHandoff({
  userName,
  callbackUrl,
}: ExistingSessionHandoffProps) {
  const [loading, setLoading] = useState(false)
  const { isNativeApp, setAuthToken } = useMobileApp()

  const handleContinue = () => {
    setLoading(true)
    window.location.href = '/auth/mobile/complete?mobile=1'
  }

  const handleDifferentAccount = async () => {
    setLoading(true)

    // Sign out current session
    await signOut({ redirect: false })
    if (isNativeApp) {
      setAuthToken('')
    }
    // Reload the same page - this will trigger OAuth since session is now cleared
    // The page will call getServerSession(), find no session, and trigger OAuth
    window.location.href = `/auth/mobile/start?callbackUrl=${encodeURIComponent(callbackUrl)}`
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={false} />
      <p className="text-sm text-muted-foreground mb-1 mt-6">
        You're already signed in as:
      </p>
      <p className="text-xl font-semibold text-foreground mb-6">{userName}</p>

      <div className="dark flex flex-col gap-3 w-full max-w-sm">
        <Button
          onClick={handleContinue}
          loading={loading}
          size="lg"
          className="w-full"
        >
          Continue as {userName}
        </Button>
        <Button
          onClick={handleDifferentAccount}
          variant="tertiary"
          size="lg"
          className="w-full"
        >
          Use a different account
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/60 mt-6 text-center max-w-sm">
        By continuing, you'll be logged into the mobile app with this account.
      </p>
    </div>
  )
}
