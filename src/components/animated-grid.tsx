import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useEffect } from 'react'

import { cn } from '@/lib/utils'

export function AnimatedGrid({
  children,
  layoutId,
}: {
  children: React.ReactNode
  layoutId: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 auto-rows-fr',
        '@2xl/section:grid-cols-2 @2xl/section:gap-6 @5xl/section:grid-cols-3',
      )}
      id={layoutId}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  )
}

export function AnimatedGridItem({
  id,
  layoutId,
  children,
  isFirstRender,
}: {
  id: string
  layoutId: string
  children: React.ReactNode
  isFirstRender: boolean
}) {
  return (
    <motion.div
      key={id}
      layout
      layoutId={layoutId}
      initial={isFirstRender ? {} : { opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0, transition: { duration: 0.1 } }}
      transition={{
        layout: { type: 'spring', bounce: 0.2, duration: 0.4 },
        duration: 0.25,
        scale: { type: 'spring', visualDuration: 0.25, bounce: 0.1 },
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

export function useIsFirstRender() {
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return isFirstRender
}
