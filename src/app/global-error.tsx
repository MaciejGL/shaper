'use client'

import { Home, RefreshCw } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect } from 'react'

import { AnimatedLogo } from '@/components/animated-logo'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error with PostHog
    posthog.captureException(error)
  }, [error])

  const handleTryAgain = () => {
    // Full page reload to clear all state
    window.location.reload()
  }

  return (
    <div className="dark flex flex-col items-center justify-center min-h-screen bg-background px-4 w-full">
      <AnimatedLogo size={80} infinite={false} />
      <h1 className="text-xl font-semibold mt-6 mb-2 text-foreground">
        Something went wrong...
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Please try again later. If the problem persists, please contact support.
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={handleTryAgain} iconStart={<RefreshCw />}>
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
    </div>
  )
}
