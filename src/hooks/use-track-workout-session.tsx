import { useCallback, useEffect, useRef } from 'react'

import { useFitspaceLogWorkoutProgressMutation } from '@/generated/graphql-client'

const TICK_INTERVAL = 20
const INACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useTrackWorkoutSession(
  dayId?: string,
  isActive?: boolean,
  isCompleted?: boolean,
  lastActivityTimestamp?: number, // When user last interacted with sets
) {
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null)
  const lastTickRef = useRef<number>(new Date().getTime())
  const isPageVisible = useRef<boolean>(true)

  const { mutateAsync: logWorkoutProgress } =
    useFitspaceLogWorkoutProgressMutation({
      onError: (error) => {
        // Only log errors, don't throw - network issues are expected
        console.info('Failed to send workout progress tick', error)
      },
    })

  const sendTick = useCallback(async () => {
    if (!dayId || !isPageVisible.current) return

    // Check for inactivity - if user hasn't done anything for 5+ minutes, don't send tick
    const now = Date.now()
    const timeSinceLastActivity = lastActivityTimestamp
      ? now - lastActivityTimestamp
      : 0

    if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
      console.info(
        'Auto-pausing workout tracking due to inactivity (>5 minutes)',
      )
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    try {
      await logWorkoutProgress({
        dayId: dayId,
        tick: TICK_INTERVAL,
      })
      lastTickRef.current = now
    } catch {
      // Silently handle errors - they're already logged by onError
      // This prevents unhandled promise rejections
    }
  }, [dayId, lastActivityTimestamp, logWorkoutProgress])

  // Main interval effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Don't start interval if conditions aren't met
    if (!isActive || isCompleted || !dayId) {
      return
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      sendTick()
    }, TICK_INTERVAL * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, isCompleted, dayId, sendTick])

  // Visibility and unload handling
  useEffect(() => {
    if (!isActive || isCompleted || !dayId) {
      return
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Stop ticks when page is hidden to avoid failed requests
        isPageVisible.current = false
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      } else if (document.visibilityState === 'visible') {
        // Resume ticks when page becomes visible again
        isPageVisible.current = true
        if (isActive && !isCompleted && !intervalRef.current) {
          intervalRef.current = setInterval(() => {
            sendTick()
          }, TICK_INTERVAL * 1000)
        }
      }
    }

    const handleBeforeUnload = () => {
      // Send final tick synchronously before page unloads
      if (dayId && isPageVisible.current) {
        // Use sendBeacon for reliable delivery on page unload
        const body = JSON.stringify({
          query: `mutation { logWorkoutProgress(dayId: "${dayId}", tick: ${TICK_INTERVAL}) }`,
        })
        navigator.sendBeacon('/api/graphql', body)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [dayId, isActive, isCompleted, sendTick])

  return {}
}
