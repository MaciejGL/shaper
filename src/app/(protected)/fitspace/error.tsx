'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Capture error with PostHog
    posthog.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      {process.env.NODE_ENV === 'development' ? (
        <p className="text-sm text-muted-foreground">{error.message}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please try again later. If the problem persists, please contact
          support.
        </p>
      )}
      <Button onClick={reset} className="mt-4">
        Reset
      </Button>
    </div>
  )
}
