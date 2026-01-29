import { ReactNode } from 'react'

export interface TourStepImage {
  src: string
  alt: string
  widthClassName?: string
}

export interface TourStep {
  /** Unique identifier for the step */
  id: string
  /** Selector for the target element to highlight (optional - if not provided, popover is centered) */
  target?: string
  /** Title displayed in the popover */
  title: string
  /** Description paragraphs */
  description: string[]
  /** Optional image shown in the popover */
  image?: TourStepImage
  /** Popover placement relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** Custom footer content (replaces default navigation) */
  footer?: ReactNode | ((ctx: TourFooterContext) => ReactNode)
}

export interface TourFooterContext {
  stepIndex: number
  stepsCount: number
  isFirstStep: boolean
  isLastStep: boolean
  next: () => void
  prev: () => void
  close: () => void
}

export interface TourStepChangeContext {
  stepIndex: number
  stepsCount: number
  stepId: string
  isFirstStep: boolean
  isLastStep: boolean
}

export interface TourProps {
  /** Array of tour steps */
  steps: TourStep[]
  /** Whether the tour is currently active */
  open: boolean
  /** Called when the tour is completed or dismissed */
  onComplete: () => void
  /** Called when user clicks skip/close */
  onSkip?: () => void
  /** Show progress indicator (e.g., "1 of 6") */
  showProgress?: boolean
  /** Allow closing via X button */
  allowClose?: boolean
  /** Notified whenever the visible step changes */
  onStepChange?: (ctx: TourStepChangeContext) => void
  /** Notified when the user explicitly closes/skips the tour */
  onClose?: (ctx: TourStepChangeContext) => void
}
