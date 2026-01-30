'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import { SimpleLogo } from '@/components/simple-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { TourStepImage } from './types'

interface TourPopoverProps {
  title: string
  description: string[]
  image?: TourStepImage
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
      image,
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
    const shouldReduceMotion = useReducedMotion()
    const isWelcomeStep = stepId === 'welcome'

    const transitionDuration = shouldReduceMotion ? 0 : 0.28

    return (
      <motion.div
        ref={ref}
        layout="size"
        className={cn(
          'fixed top-0 left-0 w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-card py-4 shadow-2xl will-change-transform',
          className,
        )}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: position.left,
          y: position.top,
        }}
        transition={{
          duration: transitionDuration,
          ease: 'easeOut',
          layout: { duration: transitionDuration, ease: 'easeOut' },
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 px-4">
          <div className="flex-1">
            {showProgress && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {!isWelcomeStep && (
                  <SimpleLogo size={16} className="text-muted-foreground" />
                )}
                <span>
                  {currentStep} of {totalSteps}
                </span>
              </div>
            )}

            {isWelcomeStep && (
              <div className="flex justify-center my-6">
                <SimpleLogo size={56} className="text-primary" />
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

        {image && (
          <div className="mb-4 px-4">
            <Image
              src={image.src}
              alt={image.alt}
              width={340}
              height={200}
              className={cn('mx-auto h-auto', image.widthClassName)}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={true}
              quality={100}
            />
          </div>
        )}

        {/* Description - animate container only for better performance */}
        <div className="mb-5 px-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={stepId}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              className="text-sm text-muted-foreground leading-relaxed text-pretty"
            >
              {description.map((p, idx) => (
                <p
                  key={`${stepId}-${idx}`}
                  className="whitespace-pre-wrap mt-2"
                >
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
