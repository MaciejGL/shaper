'use client'

import { useSession } from 'next-auth/react'

import { useActivityHeartbeat } from '@/hooks/use-activity-heartbeat'

/**
 * Activity Heartbeat Component
 *
 * Tracks user activity to prevent push notifications while actively using the app.
 * This component should be mounted at the root level to track activity across all pages.
 */
export function ActivityHeartbeat() {
  const session = useSession()
  const isAuthenticated = session.status === 'authenticated'

  useActivityHeartbeat(isAuthenticated)

  return null
}
