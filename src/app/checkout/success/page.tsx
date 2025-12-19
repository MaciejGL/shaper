'use client'

import { CheckCircle, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { getBaseUrl } from '@/lib/get-base-url'

const TARGET_PATH = 'fitspace/progress?premium_activated=true'
const APP_LINK_URL =
  'https://www.hypro.app/fitspace/progress?premium_activated=true'

export default function CheckoutSuccessPage() {
  const [showManualButton, setShowManualButton] = useState(false)
  const appOpenedRef = useRef(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpenedRef.current = true
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', () => {
      appOpenedRef.current = true
    })

    // Try App Link (HTTPS URL that Android/iOS intercepts)
    const timer = setTimeout(() => {
      window.location.href = APP_LINK_URL

      // If still here after 1.5s and page never went to background, show manual button
      setTimeout(() => {
        if (!appOpenedRef.current) {
          setShowManualButton(true)
        }
      }, 1500)
    }, 500)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleOpenApp = () => {
    window.location.href = APP_LINK_URL
  }

  const handleContinueWeb = () => {
    window.location.href = `${getBaseUrl()}/${TARGET_PATH}`
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-background">
      <div className="container-hypertro text-center space-y-6 max-w-sm">
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
