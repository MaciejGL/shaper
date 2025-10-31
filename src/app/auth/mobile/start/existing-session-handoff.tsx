'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'

interface ExistingSessionHandoffProps {
  userName: string
  email: string
}

/**
 * Shows when user is already logged in browser
 * Allows them to continue with current account or sign out to use different one
 */
export function ExistingSessionHandoff({
  userName,
  email,
}: ExistingSessionHandoffProps) {
  const [loading, setLoading] = useState(false)
  const [showLogoutMessage, setShowLogoutMessage] = useState(false)

  const handleContinue = () => {
    setLoading(true)
    window.location.href = '/auth/mobile/complete?mobile=1'
  }

  const handleDifferentAccount = async () => {
    // Sign out and automatically open mobile app to restart flow
    await signOut({ redirect: false })

    // Deep link back to mobile app
    // Using just 'hypro://' opens app at root (login page if not authenticated)
    window.location.href = 'hypro://'

    // Show fallback message in case deep link doesn't work
    setTimeout(() => {
      setShowLogoutMessage(true)
    }, 1000)
  }

  if (showLogoutMessage) {
    return (
      <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
        <AnimatedLogo size={80} infinite={false} />
        <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
          Signed Out
        </h1>
        <p className="text-sm text-muted-foreground mb-2">
          Opening the mobile app...
        </p>
        <p className="text-xs text-muted-foreground/60">
          If the app doesn't open, please return to it manually.
        </p>
      </div>
    )
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={false} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Continue to App
      </h1>
      <p className="text-sm text-muted-foreground mb-1">
        You're already signed in as:
      </p>
      <p className="text-base font-semibold text-foreground mb-6">{userName}</p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
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
          variant="ghost"
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
