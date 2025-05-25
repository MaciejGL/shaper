import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'

// Animation component for consistent transitions
export function AnimatedContainer({
  children,
  isVisible,
  className,
  id,
}: {
  children: React.ReactNode
  isVisible: boolean
  className?: string
  id: string
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 25,
            duration: 0.1,
          }}
          className={cn('overflow-hidden', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
