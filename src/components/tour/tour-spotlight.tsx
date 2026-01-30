'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface TourSpotlightProps {
  /** Bounding rect of the target element */
  rect: {
    top: number
    left: number
    width: number
    height: number
  }
  /** Padding around the spotlight */
  padding?: number
  /** Border radius of the spotlight */
  borderRadius?: number
}

export function TourSpotlight({
  rect,
  padding = 2,
  borderRadius = 16,
}: TourSpotlightProps) {
  const shouldReduceMotion = useReducedMotion()

  const x = rect.left - padding
  const y = rect.top - padding
  const width = rect.width + padding * 2
  const height = rect.height + padding * 2

  // Use transform-based positioning (x, y) for GPU acceleration
  // Width/height set via style to avoid layout thrashing
  const transitionDuration = shouldReduceMotion ? 0 : 0.22

  return (
    <motion.div
      className={cn(
        'fixed top-0 left-0 pointer-events-none will-change-transform',
        'ring-4 ring-ring rounded-2xl outline-2 outline-[invert(1)] shadow-2xl',
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x, y }}
      transition={{
        opacity: { duration: shouldReduceMotion ? 0 : 0.12, ease: 'easeOut' },
        x: { duration: transitionDuration, ease: 'easeOut' },
        y: { duration: transitionDuration, ease: 'easeOut' },
      }}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}
