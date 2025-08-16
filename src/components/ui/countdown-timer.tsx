'use client'

import { CheckIcon, PlayIcon, TimerIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button, ButtonProps } from './button'

type CountdownState = 'idle' | 'running' | 'completed'

interface CountdownTimerProps {
  /** Rest duration in seconds */
  restDuration: number
  /** Callback function called when countdown completes */
  onComplete?: () => void
  /** Additional CSS classes */
  className?: string
  /** Button variant */
  variant?: ButtonProps['variant']
}

/**
 * CountdownTimer Component
 *
 * A button-styled countdown timer for rest periods between exercises.
 * Click to start countdown, click again to reset, animates on completion.
 */
export function CountdownTimer({
  restDuration,
  onComplete,
  className,
  variant,
}: CountdownTimerProps) {
  const [state, setState] = useState<CountdownState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(restDuration)

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Start countdown
  const startCountdown = useCallback(() => {
    setState('running')
    setTimeRemaining(restDuration)
  }, [restDuration])

  // Reset countdown
  const resetCountdown = useCallback(() => {
    setState('idle')
    setTimeRemaining(restDuration)
  }, [restDuration])

  // Handle button click
  const handleClick = useCallback(() => {
    if (state === 'idle') {
      startCountdown()
    } else if (state === 'running') {
      resetCountdown()
    } else if (state === 'completed') {
      resetCountdown()
    }
  }, [state, startCountdown, resetCountdown])

  // Countdown effect
  useEffect(() => {
    if (state !== 'running') return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setState('completed')
          onComplete?.()
          // Auto-reset to idle after 3 seconds

          setTimeout(() => {
            setState('idle')
            setTimeRemaining(restDuration)
          }, 3000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state, onComplete, restDuration])

  // Reset when restDuration changes
  useEffect(() => {
    setState('idle')
    setTimeRemaining(restDuration)
  }, [restDuration])

  const getButtonContent = () => {
    switch (state) {
      case 'idle':
        return formatTime(restDuration)
      case 'running':
        return formatTime(timeRemaining)
      case 'completed':
        return 'Done!'
    }
  }

  return (
    <Button
      variant={state === 'completed' ? 'default' : variant || 'tertiary'}
      onClick={handleClick}
      className={cn(
        'transition-all duration-250 tabular-nums gap-3',
        state === 'completed' &&
          'bg-green-500/20 hover:bg-green-600/20 text-white',
        state === 'running' && 'animate-pulse',
        className,
      )}
      iconStart={
        state === 'running' ? (
          <TimerIcon className="text-blue-500 animate-pulse" />
        ) : state === 'completed' ? (
          <CheckIcon />
        ) : (
          <TimerIcon className="text-blue-500" />
        )
      }
      iconEnd={
        state === 'idle' ? (
          <PlayIcon className="text-muted-foreground !size-4" />
        ) : (
          <div className="bg-muted-foreground/50 !size-3.5 rounded-xs" />
        )
      }
    >
      {getButtonContent()}
    </Button>
  )
}
