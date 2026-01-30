'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Template component for fitspace routes.
 *
 * Unlike layout.tsx, template.tsx re-renders on every navigation,
 * which triggers the initial animation for smooth page transitions.
 *
 * Uses a subtle fade for mobile performance.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.15,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
