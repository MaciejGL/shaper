'use client'

import { CheckIcon, PlayIcon, SkipForwardIcon, TimerIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button, ButtonProps } from './button'

type CountdownState = 'idle' | 'running' | 'completed'

interface CountdownTimerProps {
  /** Rest duration in seconds */
  restDuration: number
  /** Callback function called when countdown completes */
  onComplete?: () => void
  /** Callback function called when timer is paused/reset */
  onPause?: () => void
  /** Additional CSS classes */
  className?: string
  /** Button variant */
  variant?: ButtonProps['variant']
  /** Button size */
  size?: ButtonProps['size']
  /** Auto-start the countdown when component mounts */
  autoStart?: boolean
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
  onPause,
  className,
  variant,
  size,
  autoStart = false,
}: CountdownTimerProps) {
  const [state, setState] = useState<CountdownState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(restDuration)

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
      // When pausing, reset the timer and call onPause to notify parent
      resetCountdown()
      onPause?.()
    } else if (state === 'completed') {
      resetCountdown()
    }
  }, [state, startCountdown, onPause, resetCountdown])

  // Add a new useEffect to handle completion callback
  useEffect(() => {
    if (state === 'completed') {
      onComplete?.()
    }
  }, [state, onComplete])

  // Countdown effect - modified to remove onComplete call
  useEffect(() => {
    if (state !== 'running') return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setState('completed')
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
  }, [state, restDuration])

  // Reset when restDuration changes
  useEffect(() => {
    setState('idle')
    setTimeRemaining(restDuration)
  }, [restDuration])

  // Auto-start countdown if autoStart is enabled
  useEffect(() => {
    if (autoStart) {
      startCountdown()
    }
  }, [autoStart, startCountdown])

  const getButtonContent = () => {
    switch (state) {
      case 'idle':
        return formatSecondsToMMSS(restDuration)
      case 'running':
        return formatSecondsToMMSS(timeRemaining)
      case 'completed':
        return 'Done!'
    }
  }

  // Calculate progress percentage for filling animation
  const progressPercentage =
    state === 'running'
      ? ((restDuration - timeRemaining) / restDuration) * 100
      : 0

  return (
    <Button
      variant={state === 'completed' ? 'default' : variant || 'tertiary'}
      size={size}
      onClick={handleClick}
      className={cn(
        'transition-all duration-250 tabular-nums gap-3 relative overflow-hidden',
        state === 'completed' &&
          'bg-green-500/20 hover:bg-green-600/20 text-white',

        className,
      )}
      style={
        {
          '--progress': `${progressPercentage}%`,
        } as React.CSSProperties
      }
      iconStart={
        state === 'running' ? (
          <TimerIcon className="text-amber-600 relative z-[1]" />
        ) : state === 'completed' ? (
          <CheckIcon className="relative z-[1]" />
        ) : (
          <TimerIcon className="text-amber-600 relative z-[1]" />
        )
      }
      iconEnd={
        state === 'idle' ? (
          <PlayIcon className="text-muted-foreground relative z-[1]" />
        ) : (
          <SkipForwardIcon className="relative z-[1]" />
        )
      }
    >
      {/* Progress fill background */}
      {state === 'running' && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-amber-500/60 to-amber-600/60 transition-[width] duration-1000 ease-linear animate-pulse"
          style={{
            width: `var(--progress, 0%)`,
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-[1]">{getButtonContent()}</div>
    </Button>
  )
}

// Format time as MM:SS
export const formatSecondsToMMSS = (
  seconds: number,
  options: {
    hideEmptyMinutes?: boolean
  } = {
    hideEmptyMinutes: false,
  },
) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (options.hideEmptyMinutes && minutes === 0) {
    return `${remainingSeconds.toString().padStart(2, '0')}s`
  }

  return `${minutes.toString().padStart(options.hideEmptyMinutes ? 0 : 2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
