'use client'

import type * as React from 'react'

import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  usePostHogUserEnhanced()

  return <>{children}</>
}

export default PostHogProvider
