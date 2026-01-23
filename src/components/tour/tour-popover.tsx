'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import { SimpleLogo } from '@/components/simple-logo'
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
    const isWelcomeStep = stepId === 'welcome'

    return (
      <motion.div
        ref={ref}
        layout="size"
        className={cn(
          'fixed w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-card py-4 shadow-2xl',
          className,
        )}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          top: position.top,
          left: position.left,
        }}
        transition={{
          duration: 0.28,
          ease: 'easeOut',
          layout: { duration: 0.28, ease: 'easeOut' },
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 px-4">
          <div className="flex-1">
            {showProgress && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {!isWelcomeStep && (
                  <motion.div layoutId="hypro-tour-logo">
                    <SimpleLogo size={16} className="text-muted-foreground" />
                  </motion.div>
                )}
                <span>
                  {currentStep} of {totalSteps}
                </span>
              </div>
            )}

            {isWelcomeStep && (
              <div className="flex justify-center my-6">
                <motion.div layoutId="hypro-tour-logo">
                  <SimpleLogo size={56} className="text-primary" />
                </motion.div>
              </div>
            )}

            <h3 className="text-xl font-semibold text-foreground mt-6">
              {title}
            </h3>
          </div>
          {allowClose && (
            <Button
              variant="ghost"
              size="icon-md"
              onClick={onClose}
              className="absolute top-4 right-4"
              aria-label="Close tour"
              iconOnly={<X className="size-5" />}
            />
          )}
        </div>

        {/* Description */}
        <div className="mb-5 px-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={stepId}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="text-sm text-muted-foreground leading-relaxed text-pretty"
            >
              {description.map((p, idx) => (
                <motion.p
                  key={`${stepId}-${idx}`}
                  className="whitespace-pre-wrap mt-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {p}
                </motion.p>
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
