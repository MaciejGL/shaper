'use client'

import { Clock } from 'lucide-react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { createDeepLink } from '@/lib/deep-links'

interface SessionTokenExpiredProps {
  message?: string
  returnPath?: string
}

/**
 * Session Token Expired Component
 *
 * Displays when a session token is invalid or expired.
 * Provides option to return to mobile app.
 */
export function SessionTokenExpired({
  message = 'Your session link has expired',
  returnPath = 'fitspace',
}: SessionTokenExpiredProps) {
  const handleReturnToApp = () => {
    const deepLink = createDeepLink(returnPath)

    try {
      window.location.href = deepLink
      // Fallback to web after delay
      setTimeout(() => {
        window.location.href = `${window.location.origin}/${returnPath}`
      }, 1000)
    } catch {
      window.location.href = `${window.location.origin}/${returnPath}`
    }
  }

  return (
    <div className="dark min-h-screen w-full bg-background flex-center">
      <div className="container-hypertro mx-auto max-w-md p-4">
        <Card borderless variant="secondary" className="w-full text-center">
          <CardHeader>
            <div className="flex-center w-full">
              <BiggyIcon icon={Clock} variant="default" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Session Expired
            </h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">
                Please return to the app and try again.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReturnToApp} size="lg" className="w-full">
              Return to App
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
