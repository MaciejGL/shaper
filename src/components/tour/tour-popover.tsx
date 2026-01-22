'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TourPopoverProps {
  title: string
  description: string[]
  stepId: string
  position: { top: number; left: number }
  currentStep: number
  totalSteps: number
  showProgress?: boolean
  allowClose?: boolean
  isFirstStep: boolean
  isLastStep: boolean
  onNext: () => void
  onPrev: () => void
  onClose: () => void
  /** Custom footer content (replaces default navigation) */
  footer?: ReactNode
  /** Additional class names */
  className?: string
}

export const TourPopover = forwardRef<HTMLDivElement, TourPopoverProps>(
  function TourPopover(
    {
      title,
      description,
      stepId,
      position,
      currentStep,
      totalSteps,
      showProgress = true,
      allowClose = true,
      isFirstStep,
      isLastStep,
      onNext,
      onPrev,
      onClose,
      footer,
      className,
    },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        layout
        className={cn(
          'fixed w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-card py-4 shadow-lg',
          className,
        )}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          top: position.top,
          left: position.left,
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 px-4">
          <div className="flex-1">
            {showProgress && (
              <div className="text-xs text-muted-foreground mb-1">
                {currentStep} of {totalSteps}
              </div>
            )}
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
          {allowClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 -m-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close tour"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Description */}
        <div className="mb-5 px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stepId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="text-sm text-muted-foreground leading-relaxed text-pretty"
            >
              {description.map((p, idx) => (
                <p key={idx} className={idx === 0 ? undefined : 'mt-2'}>
                  {p}
                </p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4 px-4">
            {footer}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4 px-4">
            {isFirstStep ? (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Skip
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrev}
                iconStart={<ArrowLeft />}
              >
                Back
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={isLastStep ? onClose : onNext}
              iconEnd={isLastStep ? undefined : <ArrowRight />}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </motion.div>
    )
  },
)
