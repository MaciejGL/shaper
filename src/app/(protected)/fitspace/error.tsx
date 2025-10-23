'use client'

import { RefreshCw } from 'lucide-react'
import posthog from 'posthog-js'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'

export default function ErrorPage({
  error,
}: {
  error: Error
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
    <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      {process.env.NODE_ENV === 'development' ? (
        <p className="text-sm text-muted-foreground">{error.message}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please try again later. If the problem persists, please contact
          support.
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleTryAgain} iconStart={<RefreshCw />}>
          Try Again
        </Button>
        <ButtonLink href="/fitspace/workout" variant="secondary">
          Go To Workout
        </ButtonLink>
      </div>
    </div>
  )
}
