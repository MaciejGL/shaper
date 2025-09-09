import { useEffect } from 'react'
import { useRef } from 'react'

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
  const lastTickRef = useRef<number>(Date.now())

  const { mutateAsync: logWorkoutProgress } =
    useFitspaceLogWorkoutProgressMutation({
      onError: (error) => {
        console.info('Failed to send workout progress tick', error)
      },
    })

  const sendTick = async () => {
    if (!dayId) return

    // Check for inactivity - if user hasn't done anything for 10+ minutes, don't send tick
    const now = Date.now()
    const timeSinceLastActivity = lastActivityTimestamp
      ? now - lastActivityTimestamp
      : 0

    if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
      console.info(
        'Auto-pausing workout tracking due to inactivity (>10 minutes)',
      )
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    try {
      await logWorkoutProgress({
        dayId: dayId,
        tick: TICK_INTERVAL,
      })
      lastTickRef.current = now
    } catch (e) {
      console.error('Failed to send workout progress tick', e)
    }
  }

  useEffect(() => {
    if (!isActive || isCompleted || !dayId) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      sendTick()
    }, TICK_INTERVAL * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isCompleted, dayId, lastActivityTimestamp])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendTick() // Final tick on tab switch (optional)
      }
    }

    if (isActive && !isCompleted) {
      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('beforeunload', () => sendTick())
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', () => sendTick())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, isCompleted])

  return {}
}
