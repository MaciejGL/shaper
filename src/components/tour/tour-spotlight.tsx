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
  return (
    <motion.div
      className={cn(
        'fixed pointer-events-none',
        'ring-4 ring-ring rounded-xl outline outline-primary/80',
      )}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        borderRadius,
      }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}
    />
  )
}
