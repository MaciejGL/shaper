'use client'

import { motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { TourPopover } from './tour-popover'
import { TourSpotlight } from './tour-spotlight'
import type {
  TourFooterContext,
  TourProps,
  TourStep,
  TourStepChangeContext,
} from './types'

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const OVERLAY_CLASS = 'bg-black/60'
const CUTOUT_PADDING = 2
const CUTOUT_RADIUS = 12

function getTargetRect(selector: string): TargetRect | null {
  try {
    const el = document.querySelector(selector)
    if (!(el instanceof HTMLElement)) return null
    return el.getBoundingClientRect()
  } catch {
    return null
  }
}

function rectsIntersect(a: TargetRect, b: TargetRect) {
  return !(
    a.left + a.width <= b.left ||
    b.left + b.width <= a.left ||
    a.top + a.height <= b.top ||
    b.top + b.height <= a.top
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function calculatePopoverPosition(
  targetRect: TargetRect | null,
  placement: TourStep['placement'] = 'top',
  popoverWidth = 340,
  popoverHeight = 200,
): { top: number; left: number } {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 16
  const spotlightPadding = 8
  const gap = margin + spotlightPadding

  // Centered (no target)
  if (!targetRect) {
    return {
      top: Math.max(margin, (viewportHeight - popoverHeight) / 2),
      left: Math.max(margin, (viewportWidth - popoverWidth) / 2),
    }
  }

  const targetCenterX = targetRect.left + targetRect.width / 2
  const targetCenterY = targetRect.top + targetRect.height / 2

  const computeFor = (p: NonNullable<TourStep['placement']>) => {
    if (p === 'center') {
      return {
        top: (viewportHeight - popoverHeight) / 2,
        left: (viewportWidth - popoverWidth) / 2,
      }
    }

    let top: number
    let left: number

    switch (p) {
      case 'bottom':
        top = targetRect.top + targetRect.height + gap
        left = targetCenterX - popoverWidth / 2
        break
      case 'left':
        top = targetCenterY - popoverHeight / 2
        left = targetRect.left - popoverWidth - gap
        break
      case 'right':
        top = targetCenterY - popoverHeight / 2
        left = targetRect.left + targetRect.width + gap
        break
      case 'top':
      default:
        top = targetRect.top - popoverHeight - gap
        left = targetCenterX - popoverWidth / 2
        break
    }

    return {
      top: clamp(top, margin, viewportHeight - popoverHeight - margin),
      left: clamp(left, margin, viewportWidth - popoverWidth - margin),
    }
  }

  const safeTargetRect: TargetRect = {
    top: targetRect.top - spotlightPadding,
    left: targetRect.left - spotlightPadding,
    width: targetRect.width + spotlightPadding * 2,
    height: targetRect.height + spotlightPadding * 2,
  }

  const initialPlacement = placement ?? 'top'
  const candidates: NonNullable<TourStep['placement']>[] = [
    initialPlacement,
    initialPlacement === 'top'
      ? 'bottom'
      : initialPlacement === 'bottom'
        ? 'top'
        : initialPlacement === 'left'
          ? 'right'
          : initialPlacement === 'right'
            ? 'left'
            : 'bottom',
    'bottom',
    'top',
    'right',
    'left',
    'center',
  ]

  for (const p of candidates) {
    const pos = computeFor(p)
    const popoverRect: TargetRect = {
      top: pos.top,
      left: pos.left,
      width: popoverWidth,
      height: popoverHeight,
    }
    if (!rectsIntersect(popoverRect, safeTargetRect)) return pos
  }

  return computeFor('center')
}

export function Tour({
  steps,
  open,
  onComplete,
  onSkip,
  showProgress = true,
  allowClose = true,
  onStepChange,
  onClose,
}: TourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [popoverSize, setPopoverSize] = useState({ width: 340, height: 200 })
  const [lastCutoutRect, setLastCutoutRect] = useState<TargetRect | null>(null)

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  // Update target rect before paint to avoid 1-frame \"center\" state.
  useLayoutEffect(() => {
    if (!open || !currentStep) return
    if (!currentStep.target) {
      setTargetRect(null)
      return
    }
    const rect = getTargetRect(currentStep.target)
    setTargetRect(rect)
    if (rect) {
      setLastCutoutRect(rect)
    }
  }, [currentStep, open])

  // Keep target rect updated on scroll/resize.
  useEffect(() => {
    if (!open || !currentStep?.target) return

    const updateRect = () => {
      const rect = getTargetRect(currentStep.target!)
      setTargetRect(rect)
      if (rect) {
        setLastCutoutRect(rect)
      }
    }

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
    }
  }, [currentStep?.target, open])

  // Reset step index when tour opens
  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0)
    }
  }, [open])

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track actual popover size for correct positioning (no overlap).
  useLayoutEffect(() => {
    if (!open) return
    const el = popoverRef.current
    if (!el) return

    const update = () => {
      setPopoverSize({
        width: el.offsetWidth || 340,
        height: el.offsetHeight || 200,
      })
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => ro.disconnect()
  }, [open, currentStepIndex])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStepIndex((i) => i + 1)
    }
  }, [isLastStep, onComplete])

  const handlePrev = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleClose = useCallback(() => {
    if (onClose && currentStep) {
      const ctx: TourStepChangeContext = {
        stepIndex: currentStepIndex,
        stepsCount: steps.length,
        stepId: currentStep.id,
        isFirstStep,
        isLastStep,
      }
      onClose(ctx)
    }
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }, [
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    onClose,
    onComplete,
    onSkip,
    steps.length,
  ])

  useEffect(() => {
    if (!open) return
    if (!onStepChange) return
    if (!currentStep) return

    const ctx: TourStepChangeContext = {
      stepIndex: currentStepIndex,
      stepsCount: steps.length,
      stepId: currentStep.id,
      isFirstStep,
      isLastStep,
    }
    onStepChange(ctx)
  }, [
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    onStepChange,
    open,
    steps.length,
  ])

  // Intentionally not memoized: keeps React Compiler happy and this is cheap.
  const footerNode = (() => {
    const footer = currentStep?.footer
    if (!footer) return undefined
    if (typeof footer !== 'function') return footer

    const ctx: TourFooterContext = {
      stepIndex: currentStepIndex,
      stepsCount: steps.length,
      isFirstStep,
      isLastStep,
      next: handleNext,
      prev: handlePrev,
      close: handleClose,
    }

    return footer(ctx)
  })()

  const popoverPosition = useMemo(() => {
    if (!currentStep) return { top: 0, left: 0 }
    return calculatePopoverPosition(
      targetRect,
      currentStep.placement ?? (targetRect ? 'top' : 'center'),
      popoverSize.width,
      popoverSize.height,
    )
  }, [currentStep, popoverSize.height, popoverSize.width, targetRect])

  if (!open || !mounted || !currentStep) return null

  return createPortal(
    <div className="fixed inset-0 z-9999">
      {/* Overlay (always mounted). Full-screen dim for centered steps. */}
      <motion.div
        className={`absolute inset-0 ${OVERLAY_CLASS} pointer-events-none`}
        aria-hidden="true"
        initial={false}
        animate={{ opacity: targetRect ? 0 : 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      />

      {/* Cutout overlay (rounded hole) for spotlight steps. Keeps last rect to avoid \"fly-in\". */}
      {(() => {
        const rect = targetRect ?? lastCutoutRect
        if (!rect) return null
        return (
          <motion.div
            className="fixed pointer-events-none"
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: targetRect ? 1 : 0,
              top: rect.top - CUTOUT_PADDING,
              left: rect.left - CUTOUT_PADDING,
              width: rect.width + CUTOUT_PADDING * 2,
              height: rect.height + CUTOUT_PADDING * 2,
              borderRadius: CUTOUT_RADIUS,
            }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )
      })()}

      {/* Spotlight (only if target exists) */}
      {targetRect && <TourSpotlight rect={targetRect} />}

      {/* Popover */}
      <div className="relative z-10 pointer-events-auto">
        <TourPopover
          ref={popoverRef}
          title={currentStep.title}
          description={currentStep.description}
          image={currentStep.image}
          stepId={currentStep.id}
          position={popoverPosition}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          showProgress={showProgress}
          allowClose={allowClose}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
          footer={footerNode}
        />
      </div>
    </div>,
    document.body,
  )
}
