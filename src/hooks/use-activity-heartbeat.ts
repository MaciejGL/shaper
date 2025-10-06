import { useCallback, useEffect, useRef } from 'react'

/**
 * Activity Heartbeat Hook
 *
 * Sends periodic heartbeats to server to track user activity.
 * This prevents push notifications from being sent while user is actively using the app.
 *
 * - Sends heartbeat every 60 seconds when page is visible
 * - Automatically stops when page is hidden/backgrounded
 * - Resumes when page becomes visible again
 * - Only runs when user is authenticated
 */

const HEARTBEAT_INTERVAL = 2 * 60 * 1000 // 2 minutes

export function useActivityHeartbeat(isAuthenticated: boolean) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const sendHeartbeat = useCallback(async () => {
    // Don't send if page is hidden or user not authenticated
    if (document.hidden || !isAuthenticated) return

    try {
      await fetch('/api/mobile/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      // Silently fail - not critical if heartbeat fails
      console.error('Activity heartbeat failed:', error)
    }
  }, [isAuthenticated])

  const startHeartbeat = useCallback(() => {
    if (intervalRef.current || !isAuthenticated) return

    // Delay first heartbeat by 5 seconds to not block page load
    setTimeout(() => {
      if (!isAuthenticated) return
      sendHeartbeat()
    }, 5000)

    // Then send every 2 minutes
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  }, [isAuthenticated, sendHeartbeat])

  const stopHeartbeat = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      stopHeartbeat()
      return
    }

    // Start heartbeat when component mounts
    startHeartbeat()

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat()
      } else {
        startHeartbeat()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount
    return () => {
      stopHeartbeat()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, startHeartbeat])
}
