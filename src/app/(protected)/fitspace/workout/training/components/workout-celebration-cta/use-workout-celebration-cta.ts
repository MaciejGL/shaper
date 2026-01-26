import confetti from 'canvas-confetti'
import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { CelebrationKind, UseWorkoutCelebrationCtaOptions } from './types'

type ConfettiShape = import('canvas-confetti').Shape

interface CelebrationState {
  kind: CelebrationKind
  message: string
}

interface UseWorkoutCelebrationCtaReturn {
  celebration: CelebrationState | null
  start: () => void
  stop: () => void
}

function sample<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

const TAP_MESSAGES = [
  "Let's go!",
  'Good pump.',
  'Clean reps.',
  'Strong work.',
  'Nice volume!',
] as const

const HOLD_MESSAGES = [
  'LIGHTWEIGHT!',
  'WHO’S GONNA CARRY THE BOATS?!',
  'Absolute machine.',
  'That’s the grind.',
  'You’re built different.',
] as const

const MESSAGES = [...TAP_MESSAGES, ...HOLD_MESSAGES] as const

const TEXT_SHAPE_SCALAR = 4

function getCelebrationMessage(): string {
  return sample(MESSAGES)
}

function getStreamConfettiOptions(kind: CelebrationKind): {
  particleCount: number
  spread: number
  startVelocity: number
  gravity: number
  scalar: number
  ticks: number
} {
  if (kind === 'hold') {
    return {
      particleCount: 18,
      spread: 16,
      startVelocity: 64,
      gravity: 1.05,
      scalar: 1.6,
      ticks: 140,
    }
  }

  return {
    particleCount: 12,
    spread: 14,
    startVelocity: 64,
    gravity: 1,
    scalar: 1.25,
    ticks: 120,
  }
}

export function useWorkoutCelebrationCta(
  options: UseWorkoutCelebrationCtaOptions = {},
): UseWorkoutCelebrationCtaReturn {
  const { svgPathD, svgPathMatrix, emoji = '💪' } = options

  const shouldReduceMotion = useReducedMotion() ?? false
  const shapesRef = useRef<ConfettiShape[] | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const lastEmitMsRef = useRef<number>(0)

  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)

  const shapesDepsKey = useMemo(() => {
    const matrixKey = svgPathMatrix
      ? [
          svgPathMatrix.a,
          svgPathMatrix.b,
          svgPathMatrix.c,
          svgPathMatrix.d,
          svgPathMatrix.e,
          svgPathMatrix.f,
        ].join(',')
      : ''

    return `${svgPathD ?? ''}|${matrixKey}|${emoji}`
  }, [svgPathD, svgPathMatrix, emoji])

  const ensureShapes = useCallback(async (): Promise<ConfettiShape[]> => {
    if (shapesRef.current) return shapesRef.current

    const shapes: ConfettiShape[] = []

    // Gym emoji confetti
    const emojis = ['💪', '🔥', '🏆', '🔥', '✨', '🔥', '⚡️'] as const
    for (const e of emojis) {
      shapes.push(
        confetti.shapeFromText({ text: e, scalar: TEXT_SHAPE_SCALAR }),
      )
    }

    // Optional custom SVG path shape (single-color filled path).
    if (svgPathD) {
      const shape = confetti.shapeFromPath(
        svgPathMatrix
          ? { path: svgPathD, matrix: svgPathMatrix }
          : { path: svgPathD },
      )
      shapes.push(shape)
    }

    shapesRef.current = shapes
    return shapes
  }, [svgPathD, svgPathMatrix])

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearHideTimeout()
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    isRunningRef.current = false
    setCelebration(null)
  }, [clearHideTimeout])

  const start = useCallback(() => {
    if (isRunningRef.current) return

    // We keep kind for tuning, but the effect lasts only while pressed.
    const kind: CelebrationKind = 'tap'

    clearHideTimeout()
    setCelebration({ kind, message: getCelebrationMessage() })

    if (shouldReduceMotion) return
    isRunningRef.current = true

    void (async () => {
      const shapes = await ensureShapes()
      const colors = ['#fde047', '#fbbf24', '#f59e0b', '#ffffff'] as const
      const originY = 0.85

      const emit = () => {
        const base = getStreamConfettiOptions(kind)

        confetti({
          ...base,
          angle: 62,
          origin: { x: 0, y: originY },
          disableForReducedMotion: true,
          flat: true,
          shapes,
          colors: [...colors],
        })
        confetti({
          ...base,
          angle: 118,
          origin: { x: 1, y: originY },
          disableForReducedMotion: true,
          flat: true,
          shapes,
          colors: [...colors],
        })
      }

      // Important: fire immediately so quick taps still show sparks.
      emit()

      const loop = (nowMs: number) => {
        if (!isRunningRef.current) return

        // Throttle emissions so it feels like a continuous spark stream.
        if (nowMs - lastEmitMsRef.current >= 90) {
          lastEmitMsRef.current = nowMs
          emit()
        }

        rafIdRef.current = requestAnimationFrame(loop)
      }

      lastEmitMsRef.current = performance.now()
      rafIdRef.current = requestAnimationFrame(loop)
    })()
  }, [clearHideTimeout, ensureShapes, shouldReduceMotion])

  // If inputs that define the shape change, reset cached shape.
  // This keeps the hook flexible without rebuilding on every trigger.
  useEffect(() => {
    shapesRef.current = null
  }, [shapesDepsKey])

  useEffect(() => stop, [stop])

  return { celebration, start, stop }
}
