'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { PointerEvent } from 'react'
import { useCallback, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'

import { useWorkoutCelebrationCta } from './use-workout-celebration-cta'

interface WorkoutCelebrationCtaProps {
  svgPathD?: string
  svgPathMatrix?: DOMMatrix
  emoji?: string
  moveTolerancePx?: number
}

export function WorkoutCelebrationCta({
  svgPathD,
  svgPathMatrix,
  emoji,
  moveTolerancePx = 8,
}: WorkoutCelebrationCtaProps) {
  const { celebration, start, stop } = useWorkoutCelebrationCta({
    svgPathD,
    svgPathMatrix,
    emoji,
  })

  const pointerIdRef = useRef<number | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  const moveToleranceSq = useMemo(
    () => moveTolerancePx * moveTolerancePx,
    [moveTolerancePx],
  )

  const cancelPointerTracking = useCallback(() => {
    pointerIdRef.current = null
    pointerStartRef.current = null
    stop()
  }, [stop])

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return

      pointerIdRef.current = e.pointerId
      pointerStartRef.current = { x: e.clientX, y: e.clientY }
      start()
    },
    [start],
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (pointerIdRef.current !== e.pointerId) return
      const start = pointerStartRef.current
      if (!start) return

      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (dx * dx + dy * dy > moveToleranceSq) {
        cancelPointerTracking()
      }
    },
    [cancelPointerTracking, moveToleranceSq],
  )

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (pointerIdRef.current !== e.pointerId) return

      cancelPointerTracking()
    },
    [cancelPointerTracking],
  )

  const handlePointerCancel = useCallback(() => {
    cancelPointerTracking()
  }, [cancelPointerTracking])

  return (
    <div className="px-4 pb-4 flex justify-center">
      <div className="relative">
        <AnimatePresence initial={false}>
          {celebration ? (
            <motion.div
              key={celebration.message}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 520, damping: 18 }}
              className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground shadow-sm pointer-events-none"
              role="status"
              aria-live="polite"
            >
              {celebration.message}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          iconOnly={<Trophy />}
          aria-label="Celebrate workout"
          className="rounded-full text-amber-500 border-amber-200 bg-amber-500/10 dark:bg-amber-500/10 dark:border-amber-200 dark:text-amber-500"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  )
}
