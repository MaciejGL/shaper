'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Drawer, DrawerContent } from '../ui/drawer'

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
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        dialogTitle="How Personal Coaching Works"
        className={cn(
          'data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0',
          'flex flex-col gap-0 h-full p-0',
        )}
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
      </DrawerContent>
    </Drawer>
  )
}
