'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { capturePageView } from '@/lib/posthog'

/**
 * Component responsible for tracking page views with PostHog
 * Separated to handle useSearchParams properly with Suspense boundaries
 */
function PostHogPageTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')
      capturePageView(url)
    }
  }, [pathname, searchParams])

  return null
}

/**
 * PostHog page tracker wrapped with Suspense boundary
 * This prevents SSR issues with useSearchParams in Next.js 15
 */
export function PostHogPageTracker() {
  return (
    <Suspense fallback={null}>
      <PostHogPageTrackerInner />
    </Suspense>
  )
}
