import { PanInfo, motion } from 'framer-motion'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface SwipeableWrapperProps {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  disabled?: boolean
  swipeThreshold?: number
  velocityThreshold?: number
  className?: string
}

export function SwipeableWrapper({
  children,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
  swipeThreshold = 50,
  velocityThreshold = 300,
  className = '',
}: SwipeableWrapperProps) {
  const [isDragging, setIsDragging] = useState(false)
  const constraintsRef = useRef(null)

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (disabled) return

    const { offset, velocity } = info

    // Check if swipe is significant enough (either distance or velocity)
    const isSignificantSwipe =
      Math.abs(offset.x) > swipeThreshold ||
      Math.abs(velocity.x) > velocityThreshold

    if (isSignificantSwipe) {
      if (offset.x > 0 || velocity.x > 0) {
        // Swiped right (previous)
        onSwipeRight()
      } else {
        // Swiped left (next)
        onSwipeLeft()
      }
    }

    setIsDragging(false)
  }

  return (
    <div
      ref={constraintsRef}
      className={cn(
        'h-max min-h-full w-full overflow-x-hidden overflow-y-visible',
        className,
      )}
    >
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className={cn(
          'cursor-grab active:cursor-grabbing h-full w-full',
          isDragging && 'select-none',
        )}
        style={{
          touchAction: 'pan-y', // Allow vertical scrolling, prevent horizontal on mobile
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
