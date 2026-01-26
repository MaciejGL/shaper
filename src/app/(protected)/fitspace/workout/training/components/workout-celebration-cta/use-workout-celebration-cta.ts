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
  trigger: (kind: CelebrationKind) => void
  dismiss: () => void
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

const TEXT_SHAPE_SCALAR = 1.6
const BASE_SHAPES = [
  // square
  confetti.shapeFromPath({ path: 'M0 0 L10 0 L10 10 L0 10 Z' }),
  // circle
  confetti.shapeFromPath({ path: 'M5 0 A5 5 0 1 0 5.0001 0 Z' }),
] as const

function getCelebrationMessage(): string {
  return sample(MESSAGES)
}

function getConfettiOptions(kind: CelebrationKind): {
  particleCount: number
  spread: number
  startVelocity: number
  gravity: number
  scalar: number
  ticks: number
} {
  if (kind === 'hold') {
    return {
      particleCount: 120,
      spread: 28,
      startVelocity: 70,
      gravity: 1.05,
      scalar: 1.6,
      ticks: 260,
    }
  }

  return {
    particleCount: 55,
    spread: 24,
    startVelocity: 60,
    gravity: 1,
    scalar: 1.25,
    ticks: 200,
  }
}

export function useWorkoutCelebrationCta(
  options: UseWorkoutCelebrationCtaOptions = {},
): UseWorkoutCelebrationCtaReturn {
  const { svgPathD, svgPathMatrix, emoji = '💪' } = options

  const shouldReduceMotion = useReducedMotion() ?? false
  const shapesRef = useRef<ConfettiShape[] | null>(null)

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

    const shapes: ConfettiShape[] = [...BASE_SHAPES]

    // Gym emoji confetti
    const emojis = ['💪', '🔥', '🏆'] as const
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

    // Also include caller-provided emoji (defaults to 💪).
    shapes.push(
      confetti.shapeFromText({ text: emoji, scalar: TEXT_SHAPE_SCALAR }),
    )

    shapesRef.current = shapes
    return shapes
  }, [svgPathD, svgPathMatrix, emoji])

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const dismiss = useCallback(() => {
    clearHideTimeout()
    setCelebration(null)
  }, [clearHideTimeout])

  const trigger = useCallback(
    (kind: CelebrationKind) => {
      clearHideTimeout()
      setCelebration({ kind, message: getCelebrationMessage() })

      hideTimeoutRef.current = window.setTimeout(
        () => setCelebration(null),
        kind === 'hold' ? 2500 : 1500,
      )

      if (shouldReduceMotion) return

      void (async () => {
        const shapes = await ensureShapes()

        const base = getConfettiOptions(kind)
        const originY = 0.85

        const colors = ['#22c55e', '#3b82f6', '#eab308', '#f43f5e'] as const

        // Dual “cannons” from left and right edges.
        confetti({
          ...base,
          angle: 70,
          origin: { x: 0, y: originY },
          disableForReducedMotion: true,
          shapes,
          colors: [...colors],
        })
        confetti({
          ...base,
          angle: 110,
          origin: { x: 1, y: originY },
          disableForReducedMotion: true,
          shapes,
          colors: [...colors],
        })
      })()
    },
    [clearHideTimeout, ensureShapes, shouldReduceMotion],
  )

  // If inputs that define the shape change, reset cached shape.
  // This keeps the hook flexible without rebuilding on every trigger.
  useEffect(() => {
    shapesRef.current = null
  }, [shapesDepsKey])

  return { celebration, trigger, dismiss }
}
