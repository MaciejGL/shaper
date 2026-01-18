'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface TypingIndicatorProps {
  isTyping: boolean
  label: string
}

export function TypingIndicator({ isTyping, label }: TypingIndicatorProps) {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <AnimatePresence initial={false}>
      {isTyping ? (
        <motion.div
          key="typing-indicator"
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 4, height: 0 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, height: 'auto' }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 4, height: 0 }
          }
          transition={{ duration: 0.15 }}
          className="pt-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">{label}</span>
            <span className="flex items-center">
              <TypingDots reduceMotion={shouldReduceMotion} />
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function TypingDots({ reduceMotion }: { reduceMotion: boolean }) {
  const dots = [0, 1, 2] as const

  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {dots.map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={
            reduceMotion
              ? { opacity: 0.7 }
              : { y: [0, -2, 0], opacity: [0.5, 1, 0.5] }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { duration: 0.8, repeat: Infinity, delay: i * 0.12 }
          }
        />
      ))}
    </span>
  )
}
