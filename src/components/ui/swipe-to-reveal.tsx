import { PanInfo, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface SwipeAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive' | 'secondary'
  disabled?: boolean
}

interface SwipeToRevealProps {
  children: React.ReactNode
  actions: SwipeAction[]
  disabled?: boolean
  velocityThreshold?: number
  className?: string
  actionsClassName?: string
  isSwipeable?: boolean
}

export function SwipeToReveal({
  children,
  actions,
  disabled = false,
  velocityThreshold = 400,
  className,
  actionsClassName,
  isSwipeable = true,
}: SwipeToRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Validate actions on mount
  useEffect(() => {
    actions.forEach((action, index) => {
      if (!action.id) {
        console.error(
          `SwipeToReveal: Action at index ${index} is missing 'id'`,
          action,
        )
      }
      if (typeof action.onClick !== 'function') {
        console.error(
          `SwipeToReveal: Action at index ${index} has invalid 'onClick'`,
          action,
        )
      }
    })
  }, [actions])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
    }
  }, [])

  // Calculate total width of actions for animation
  const actionWidth = 80 // Width per action button
  const totalActionsWidth = actions.length * actionWidth
  const maxSwipeDistance = Math.min(totalActionsWidth, 200) // Cap at 200px

  const handleDragStart = () => {
    // Clear any existing timeout when starting a new drag
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
  }

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Clear any existing timeout and set a new one
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }

    // Set a timeout to ensure we always snap to a final position if drag gets stuck
    dragTimeoutRef.current = setTimeout(() => {
      const currentPosition = Math.abs(info.offset.x)
      const halfwayPoint = maxSwipeDistance / 2

      if (currentPosition > halfwayPoint) {
        setIsRevealed(true)
      } else {
        setIsRevealed(false)
      }
    }, 150) // 150ms timeout
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (disabled) return

    // Clear the timeout since we have a proper drag end
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }

    const { offset, velocity } = info

    // Get the current position (where the drag ended)
    const currentPosition = Math.abs(offset.x)
    const halfwayPoint = maxSwipeDistance / 2

    // Fast swipe takes priority
    const fastSwipeLeft = velocity.x < -velocityThreshold
    const fastSwipeRight = velocity.x > velocityThreshold

    if (fastSwipeLeft) {
      // Fast swipe left - always reveal
      setIsRevealed(true)
    } else if (fastSwipeRight) {
      // Fast swipe right - always close
      setIsRevealed(false)
    } else {
      // Slow drag - snap based on position
      if (currentPosition > halfwayPoint) {
        // Past halfway - snap to fully revealed
        setIsRevealed(true)
      } else {
        // Before halfway - snap back to closed
        setIsRevealed(false)
      }
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    if (action.disabled) return

    // Defensive check for onClick function
    if (typeof action.onClick !== 'function') {
      console.error('SwipeToReveal: action.onClick is not a function', action)
      return
    }

    action.onClick()
    // Close after action
    setIsRevealed(false)
  }

  const handleContentClick = () => {
    if (isRevealed) {
      // Close if revealed
      setIsRevealed(false)
    }
  }

  const getActionVariant = (variant?: SwipeAction['variant']) => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground'
    }
  }

  return (
    <div className={cn('relative overflow-hidden')}>
      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: isSwipeable ? -maxSwipeDistance : 0,
          right: 0,
        }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={isSwipeable ? handleDragStart : undefined}
        onDrag={isSwipeable ? handleDrag : undefined}
        onDragEnd={isSwipeable ? handleDragEnd : undefined}
        onClick={handleContentClick}
        animate={{ x: isRevealed ? -maxSwipeDistance : 0 }}
        transition={{
          type: 'spring',
          stiffness: 1800,
          damping: 100,
          mass: 0.8,
        }}
        className={cn('relative z-10', className)}
        style={{
          touchAction: 'pan-y', // Allow vertical scrolling
        }}
      >
        {children}
      </motion.div>

      {/* Actions background */}
      <div
        className={cn(
          'absolute z-[9] inset-y-0 right-0 flex items-center',
          actionsClassName,
        )}
        style={{ width: isSwipeable ? maxSwipeDistance : 0 }}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={cn(
              'h-full flex items-center justify-center transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              getActionVariant(action.variant),
            )}
            style={{
              width: actionWidth,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              {action.icon && <div className="size-4">{action.icon}</div>}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
