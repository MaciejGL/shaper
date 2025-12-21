'use client'

import { useEffect } from 'react'
import type * as React from 'react'

import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'
import { initPostHog } from '@/lib/posthog'

import { PostHogPageTracker } from './posthog-page-tracker'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  usePostHogUserEnhanced()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      initPostHog()
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <>
      <PostHogPageTracker />
      {children}
    </>
  )
}

export default PostHogProvider
