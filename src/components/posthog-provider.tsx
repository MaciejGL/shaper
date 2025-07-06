'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import type * as React from 'react'

import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'
// import { usePostHogUser } from '@/hooks/use-posthog-user'
import { capturePageView, initPostHog } from '@/lib/posthog'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Automatically handle user identification
  //   usePostHogUser()
  usePostHogUserEnhanced()

  useEffect(() => {
    // Initialize PostHog when the component mounts
    const init = async () => {
      await initPostHog()
    }
    init()
  }, [])

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')
      capturePageView(url)
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

export default PostHogProvider
