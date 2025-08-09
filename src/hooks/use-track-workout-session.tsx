import { useEffect } from 'react'
import { useRef } from 'react'

import { useFitspaceLogWorkoutProgressMutation } from '@/generated/graphql-client'

const TICK_INTERVAL = 20

export function useTrackWorkoutSession(
  dayId?: string,
  isActive?: boolean,
  isCompleted?: boolean,
) {
  const intervalRef = useRef<NodeJS.Timeout | number | null>(null)

  const { mutateAsync: logWorkoutProgress } =
    useFitspaceLogWorkoutProgressMutation()

  const sendTick = async () => {
    if (!dayId) return
    try {
      await logWorkoutProgress({
        dayId: dayId,
        tick: TICK_INTERVAL,
      })
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
  }, [isActive, isCompleted, dayId])

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
