import { useEffect, useState } from 'react'

export function useWorkoutTimer(startedAt: string | null | undefined) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsedSeconds(0)
      return
    }

    const startDate = new Date(startedAt).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = Math.floor((now - startDate) / 1000)
      setElapsedSeconds(Math.max(0, diff))
    }

    updateTimer() // Initial update
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startedAt])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return { elapsedSeconds, formattedTime: formatTime(elapsedSeconds) }
}
