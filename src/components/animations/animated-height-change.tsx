import { Transition, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface AnimateChangeInHeightProps {
  children: React.ReactNode
  className?: string
  transition?: Transition
}

export function AnimateChangeInHeight({
  children,
  transition,
  className,
}: AnimateChangeInHeightProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        // We only have one entry, so we can use entries[0].
        const observedHeight = entries[0].contentRect.height
        setHeight(observedHeight)
      })

      resizeObserver.observe(containerRef.current)

      return () => {
        // Cleanup the observer when the component is unmounted
        resizeObserver.disconnect()
      }
    }
  }, [])

  return (
    <motion.div
      key="item-height-change"
      className={cn(className, 'overflow-hidden px-1 -mx-1')}
      style={{ height }}
      animate={{ height }}
      transition={
        transition ?? {
          duration: 0.15,
        }
      }
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  )
}
