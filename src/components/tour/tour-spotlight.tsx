'use client'

import { motion } from 'framer-motion'

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
  borderRadius = 12,
}: TourSpotlightProps) {
  const top = rect.top - padding
  const left = rect.left - padding
  const width = rect.width + padding * 2
  const height = rect.height + padding * 2

  return (
    <motion.div
      className={cn(
        'fixed pointer-events-none',
        'ring-4 ring-ring rounded-xl outline-2 outline-[invert(1)] shadow-2xl',
      )}
      initial={{
        opacity: 0,
        top,
        left,
        width,
        height,
        borderRadius,
      }}
      animate={{
        opacity: 1,
        top,
        left,
        width,
        height,
        borderRadius,
      }}
      transition={{
        opacity: { duration: 0.12, ease: 'easeOut' },
        default: { duration: 0.22, ease: 'easeOut' },
      }}
    />
  )
}
