'use client'

import { Home, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import posthog from 'posthog-js'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error with PostHog
    posthog.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card borderless className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
          <div className="relative">
            <Image
              src="/error-broken-plate.png"
              alt="Error"
              width={160}
              height={160}
              className="h-48 w-48 text-destructive"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Oops! Something Went Wrong
            </h1>
            <p className="text-muted-foreground">
              Your workout hit a snag! Don't worry, even the best athletes face
              setbacks. Let's get you back on track.
            </p>
          </div>

          {error.digest && (
            <div className="bg-muted p-3 rounded-md w-full">
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={reset}
              className="flex-1"
              iconStart={<RefreshCw />}
            >
              Try Again
            </Button>
            <ButtonLink href="/fitspace/workout" iconStart={<Home />}>
              Go To Workout
            </ButtonLink>
          </div>

          <div className="text-xs text-muted-foreground">
            If this problem persists, please contact support with the error ID
            above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
