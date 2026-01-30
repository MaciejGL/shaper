'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Template component for fitspace routes.
 *
 * Unlike layout.tsx, template.tsx re-renders on every navigation,
 * which triggers the initial animation for smooth page transitions.
 *
 * Uses a native-feeling slide-up with fade and subtle scale.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth native feel
      }}
    >
      {children}
    </motion.div>
  )
}
