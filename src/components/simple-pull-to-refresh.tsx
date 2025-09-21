'use client'

import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

interface PullState {
  isVisible: boolean
  progress: number
  isRefreshing: boolean
  scale: number
  rotation: number
}

function PullToRefreshIndicator({ state }: { state: PullState }) {
  const isReady = state.progress >= 1

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-20 flex justify-center items-end pb-2',
        'bg-gradient-to-b from-background to-transparent z-[9999] pointer-events-none',
      )}
      style={{
        transform: state.isVisible
          ? `translateY(${Math.min(state.progress * 80 - 80, 0)}px)`
          : 'translateY(-100%)',
        transition: state.isVisible ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      <div
        className={cn(
          'flex items-center p-4 rounded-full',
          'backdrop-blur-sm',
          'transition-all duration-200',
        )}
        style={{
          transform: `scale(${state.scale})`,
        }}
      >
        {/* Spinner */}
        <Loader2
          className={cn(
            'size-8 text-primary',
            isReady ? 'opacity-100' : 'opacity-70',
            state.isRefreshing && 'animate-spin',
          )}
          style={{
            transform: state.isRefreshing
              ? undefined
              : `rotate(${state.rotation}deg)`,
            transition: state.isRefreshing
              ? undefined
              : 'transform 0.05s linear, opacity 0.2s linear',
          }}
        />
      </div>
    </div>
  )
}

export function SimplePullToRefresh() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PullState>({
    isVisible: false,
    progress: 0,
    isRefreshing: false,
    scale: 0.8,
    rotation: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let touchstartY = 0
    let isPulling = false
    let currentPullDistance = 0
    let hasTriggeredHaptic = false
    let originalBodyOverflow = ''
    let isAtTopTimer: NodeJS.Timeout | null = null
    let isPullToRefreshEnabled = false

    // Check if any modal/drawer is currently open
    const isAnyModalOpen = (): boolean => {
      return (
        // Radix dialogs, sheets, popovers, alert dialogs
        document.querySelector('[data-state="open"]') !== null ||
        // General accessibility check
        document.querySelector('[role="dialog"]') !== null
      )
    }

    // Disable scroll during pull gesture
    const disableScroll = () => {
      if (document.body.style.overflow !== 'hidden') {
        originalBodyOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      }
    }

    // Re-enable scroll
    const enableScroll = () => {
      document.body.style.overflow = originalBodyOverflow
    }

    // Handle scroll position changes
    const handleScroll = () => {
      // Don't start pull-to-refresh if any modal/drawer is open
      if (isAnyModalOpen()) {
        // Cancel any pending timer and disable pull-to-refresh
        if (isAtTopTimer) {
          clearTimeout(isAtTopTimer)
          isAtTopTimer = null
        }
        isPullToRefreshEnabled = false
        return
      }

      if (window.scrollY === 0) {
        // User reached the top, start timer to enable pull-to-refresh
        if (!isAtTopTimer && !isPullToRefreshEnabled) {
          isAtTopTimer = setTimeout(() => {
            isPullToRefreshEnabled = true
            isAtTopTimer = null
          }, 1000) // 500ms delay before enabling pull-to-refresh
        }
      } else {
        // User scrolled away from top, disable pull-to-refresh and cancel timer
        if (isAtTopTimer) {
          clearTimeout(isAtTopTimer)
          isAtTopTimer = null
        }
        isPullToRefreshEnabled = false
      }
    }

    // Initialize pull-to-refresh state based on current scroll position
    if (window.scrollY === 0 && !isAnyModalOpen()) {
      isPullToRefreshEnabled = true // If already at top on mount, enable immediately
    }

    // Reset state completely
    const resetState = () => {
      setState({
        isVisible: false,
        progress: 0,
        isRefreshing: false,
        scale: 0.8,
        rotation: 0,
      })
      enableScroll()
    }

    // Update pull indicator based on distance
    const updatePullIndicator = (pullDistance: number) => {
      const threshold = 80
      const progress = Math.min(pullDistance / threshold, 1)

      if (pullDistance <= 0) {
        resetState()
        return
      }

      setState((prev) => {
        // Smooth rotation calculation - cap at 2 full rotations when threshold is reached
        const rotationProgress = Math.min(pullDistance / threshold, 1)
        const smoothRotation = rotationProgress * 720 // Cap at 720 degrees (2 full rotations)

        return {
          ...prev,
          isVisible: true,
          progress,
          scale: 0.8 + 0.2 * progress,
          rotation: smoothRotation,
        }
      })

      // Add haptic feedback when threshold is reached (only once per pull)
      if (progress >= 1 && !hasTriggeredHaptic && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50)
        } catch (error) {
          // Vibration blocked or not supported, silently ignore
        }
        hasTriggeredHaptic = true
      } else if (progress < 1) {
        hasTriggeredHaptic = false
      }
    }

    // Touch start
    const handleTouchStart = (e: TouchEvent) => {
      // Don't start if any modal/drawer is open
      if (isAnyModalOpen()) return

      touchstartY = e.touches[0].clientY
      isPulling = false
      currentPullDistance = 0
      hasTriggeredHaptic = false
    }

    // Touch move
    const handleTouchMove = (e: TouchEvent) => {
      // Don't continue if any modal/drawer is open
      if (isAnyModalOpen()) return

      const touchY = e.touches[0].clientY
      const touchDiff = touchY - touchstartY

      // Only if pulling down from top of page AND pull-to-refresh is enabled
      if (touchDiff > 0 && window.scrollY === 0 && isPullToRefreshEnabled) {
        if (!isPulling) {
          isPulling = true
          disableScroll() // Disable scroll when starting to pull
        }
        currentPullDistance = touchDiff * 0.6 // Add some resistance
        updatePullIndicator(currentPullDistance)

        // Only prevent default if the event is cancelable
        if (e.cancelable) {
          e.preventDefault()
        }
      } else if (isPulling && touchDiff <= 0) {
        // User is dragging back up, gradually dismiss the indicator
        const upwardDistance = Math.abs(touchDiff) * 0.6
        const remainingDistance = Math.max(
          currentPullDistance - upwardDistance,
          0,
        )
        currentPullDistance = remainingDistance
        updatePullIndicator(remainingDistance)

        // If fully dismissed, reset pulling state
        if (remainingDistance <= 0) {
          isPulling = false
          enableScroll() // Re-enable scroll when fully dismissed
        }
      }
    }

    // Touch end
    const handleTouchEnd = () => {
      // Always re-enable scroll when touch ends
      if (isPulling) {
        enableScroll()
      }

      // Don't refresh if any modal/drawer is open
      if (isAnyModalOpen()) {
        isPulling = false
        currentPullDistance = 0
        resetState()
        return
      }

      const threshold = 80

      if (isPulling && currentPullDistance >= threshold) {
        // Show loading state - keep scroll disabled during refresh
        disableScroll()
        setState((prev) => ({
          ...prev,
          isRefreshing: true,
        }))

        // Reload after short delay
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        // Reset state
        isPulling = false
        currentPullDistance = 0
        resetState()
      }
    }

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('scroll', handleScroll)
      // Clear any pending timer
      if (isAtTopTimer) {
        clearTimeout(isAtTopTimer)
      }
      // Re-enable scroll on cleanup
      enableScroll()
    }
  }, [])

  // Only render after component is mounted to prevent hydration mismatch
  if (!mounted) return null

  return createPortal(<PullToRefreshIndicator state={state} />, document.body)
}
