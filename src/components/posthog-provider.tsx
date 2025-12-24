'use client'

import type * as React from 'react'

import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'

import { PostHogPageTracker } from './posthog-page-tracker'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  usePostHogUserEnhanced()

  return (
    <>
      <PostHogPageTracker />
      {children}
    </>
  )
}

export default PostHogProvider
