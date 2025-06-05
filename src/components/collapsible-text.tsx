import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export function CollapsibleText({
  text,
  maxLines = 4,
}: {
  text?: string | null
  maxLines?: number
}) {
  const [fullHeight, setFullHeight] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isSmallerThanMaxLines = fullHeight < maxLines * 20
  const initialHeight = isSmallerThanMaxLines ? fullHeight : maxLines * 20

  useEffect(() => {
    if (ref.current) {
      const height = ref.current.scrollHeight
      setFullHeight(height)
    }
  }, [text])

  if (!text) return null

  return (
    <div>
      <AnimatePresence key={'text'} mode="wait">
        <p
          className="absolute z-[-1] text-sm invisible whitespace-pre-wrap"
          ref={ref}
          style={{ height: `${fullHeight}px` }}
        >
          {text}
        </p>
        {isExpanded ? (
          <motion.p
            key={'expanded'}
            initial={{ height: `${initialHeight}px` }}
            animate={{ height: 'auto' }}
            exit={{ height: `${initialHeight}px` }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 0.5,
              duration: 0.15,
            }}
            className={cn(
              'text-sm text-muted-foreground whitespace-pre-wrap overflow-hidden',
            )}
          >
            {text}
          </motion.p>
        ) : (
          <motion.p
            key="preview"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 0.5,
              duration: 0.15,
            }}
            style={{
              height: `${initialHeight}px`,
            }}
            className={cn(
              'text-sm text-muted-foreground whitespace-pre-wrap overflow-hidden',
            )}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
      {!isSmallerThanMaxLines && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary cursor-pointer ml-auto mt-1"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
          <ChevronDown
            className={cn(
              'size-3',
              isExpanded && 'rotate-180 transition-transform',
            )}
          />
        </button>
      )}
    </div>
  )
}
