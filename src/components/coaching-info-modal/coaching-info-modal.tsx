'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

import { CancellationInfo } from './components/cancellation-info'
import { OffersSection } from './components/offers-section'
import { ProcessTimeline } from './components/process-timeline'

interface CoachingInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoachingInfoModal({
  open,
  onOpenChange,
}: CoachingInfoModalProps) {
  const [currentStep, setCurrentStep] = useState<'info' | 'offers'>('info')

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [currentStep])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fullScreen
        className="flex flex-col gap-0 h-full p-0"
        dialogTitle="How Personal Coaching Works"
      >
        {/* Scrollable content area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {currentStep === 'info' ? (
              <>
                <ProcessTimeline />
                <CancellationInfo />
              </>
            ) : (
              <OffersSection />
            )}
          </div>
        </div>

        <div className="shrink-0 border-t p-4">
          <div className="flex gap-3">
            {currentStep === 'info' ? (
              <>
                <Button
                  variant="tertiary"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setCurrentStep('offers')}
                  className="flex-1"
                >
                  View Pricing
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="tertiary"
                  onClick={() => setCurrentStep('info')}
                  className="flex-1"
                >
                  Back to Process
                </Button>
                <Button onClick={() => onOpenChange(false)} className="flex-1">
                  Got it
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
