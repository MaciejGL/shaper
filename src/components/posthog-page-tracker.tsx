'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { capturePageView, initPostHog } from '@/lib/posthog'

/**
 * Component responsible for tracking page views with PostHog
 * Separated to handle useSearchParams properly with Suspense boundaries
 */
function PostHogPageTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    // Track page views on route changes
    if (pathname) {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')

      if (status === 'authenticated') {
        const userId = session?.user?.id
        if (!userId) {
          return
        }

        void (async () => {
          const ph = await initPostHog()
          if (!ph) return

          ph.identify(userId, { userId })
          ph.capture('$pageview', { $current_url: url })
        })()
        return
      }

      capturePageView(url)
    }
  }, [pathname, searchParams, session?.user?.id, status])

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
