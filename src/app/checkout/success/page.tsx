'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getBaseUrl } from '@/lib/get-base-url'

const TARGET_PATH = 'fitspace/progress?premium_activated=true'

export default function CheckoutSuccessPage() {
  const [showManualButton, setShowManualButton] = useState(false)

  useEffect(() => {
    // Try deep link after short delay
    const timer = setTimeout(() => {
      window.location.href = `hypro://${TARGET_PATH}`

      // If still here after 2s, deep link failed - show button / fallback
      setTimeout(() => setShowManualButton(true), 2000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenApp = () => {
    window.location.href = `hypro://${TARGET_PATH}`
  }

  const handleContinueWeb = () => {
    window.location.href = `${getBaseUrl()}/${TARGET_PATH}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-sm">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>

        {!showManualButton ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Opening app...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Tap below to return to the app
            </p>
            <Button onClick={handleOpenApp} size="lg" className="w-full">
              Open App
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

