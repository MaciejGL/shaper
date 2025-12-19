'use client'

import { Suspense, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

/**
 * Checkout Success Page
 *
 * This page is the Stripe success_url target. It redirects back to the app
 * via deep link so the user returns to the native app instead of staying
 * in the browser.
 */
function CheckoutSuccessContent() {
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  useEffect(() => {
    // Redirect to app via deep link
    const deepLink = 'hypro://fitspace/progress?premium_activated=true'
    window.location.href = deepLink
    setRedirectAttempted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Payment Successful</h1>
          <p className="text-muted-foreground">
            Your Premium subscription is now active.
          </p>
        </div>

        {redirectAttempted && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you&apos;re not redirected automatically, tap the button below:
            </p>
            <Button
              onClick={() => {
                window.location.href =
                  'hypro://fitspace/progress?premium_activated=true'
              }}
              className="w-full"
            >
              Open App
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href =
                  '/fitspace/progress?premium_activated=true'
              }}
              className="w-full"
            >
              Continue in Browser
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Redirecting...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
