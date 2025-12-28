'use client'

import { Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Button } from '@/components/ui/button'
import { getBaseUrl } from '@/lib/get-base-url'

const TARGET_PATH = 'account-management'

export default function CheckoutCancelledPage() {
  const [showManualButton, setShowManualButton] = useState(false)

  useEffect(() => {
    // Trigger deep link immediately using window.location.href
    // This is the proven pattern that works for custom URL schemes
    window.location.href = `hypro://${TARGET_PATH}`

    // If user is still on this page after 2 seconds, show manual button
    // This handles cases where the deep link doesn't work (app not installed, etc.)
    const fallbackTimer = setTimeout(() => {
      setShowManualButton(true)
    }, 2000)

    return () => clearTimeout(fallbackTimer)
  }, [])

  const handleOpenApp = () => {
    window.location.href = `hypro://${TARGET_PATH}`
  }

  const handleContinueWeb = () => {
    window.location.href = `${getBaseUrl()}/${TARGET_PATH}`
  }

  return (
    <div className="dark min-h-screen w-screen flex items-center justify-center p-4 bg-background">
      <div className="container-hypertro text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <BiggyIcon icon={XCircle} size="lg" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Payment Cancelled</h1>

        {!showManualButton ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Returning to app...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tap below to return to the app
            </p>
            <Button onClick={handleOpenApp} size="lg" className="w-full">
              Return to App
            </Button>
            <Button
              onClick={handleContinueWeb}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Continue in browser
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
