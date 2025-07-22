'use client'

import { useEffect } from 'react'
import type * as React from 'react'

// import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'
import { initPostHog } from '@/lib/posthog'

import { PostHogPageTracker } from './posthog-page-tracker'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // usePostHogUserEnhanced()

  useEffect(() => {
    const init = async () => {
      await initPostHog()
    }
    init()
  }, [])

  return (
    <>
      <PostHogPageTracker />
      {children}
    </>
  )
}

export default PostHogProvider
