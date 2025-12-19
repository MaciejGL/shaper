'use client'

import { Calendar, CheckCircle, Info, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { CheckinScheduleForm } from '@/app/(protected)/fitspace/progress/components/checkin-schedule/schedule-setup-modal'
import { CheckinScheduleFormData } from '@/app/(protected)/fitspace/progress/components/checkin-schedule/types'
import { useCheckinScheduleOperations } from '@/app/(protected)/fitspace/progress/components/checkin-schedule/use-checkin-schedule'
import { GQLCheckinFrequency } from '@/generated/graphql-client'

import { BiggyIcon } from './biggy-icon'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

type OnboardingStep = 'checkins' | 'plans'

interface PostPaymentSuccessModalProps {
  open: boolean
  state: 'polling' | 'timeout' | 'ready'
  onRefresh: () => void
}

export function PostPaymentSuccessModal({
  open,
  state,
  onRefresh,
}: PostPaymentSuccessModalProps) {
  const [step, setStep] = useState<OnboardingStep>('checkins')
  const [formData, setFormData] = useState<CheckinScheduleFormData>({
    frequency: GQLCheckinFrequency.Weekly,
    dayOfWeek: 0,
    dayOfMonth: 1,
  })

  const { createSchedule, isCreating } = useCheckinScheduleOperations()

  const handleReturnToApp = () => {
    window.location.href = '/fitspace/workout'
  }

  const handleBrowsePlans = () => {
    window.location.href = '/fitspace/explore?tab=premium-plans'
  }

  const handleSaveAndContinue = () => {
    createSchedule({
      input: {
        frequency: formData.frequency,
        dayOfWeek:
          formData.frequency !== GQLCheckinFrequency.Monthly
            ? formData.dayOfWeek
            : undefined,
        dayOfMonth:
          formData.frequency === GQLCheckinFrequency.Monthly
            ? formData.dayOfMonth
            : undefined,
      },
    })
    setStep('plans')
  }

  const handleSkipCheckins = () => {
    setStep('plans')
  }

  // Prevent closing modal while polling - only allow closing when ready or timeout
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && state === 'polling') {
      // Prevent closing while still polling
      return
    }
    // Allow closing when ready or timeout - navigate away to clear URL params
    if (!newOpen) {
      handleReturnToApp()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dialogTitle="Payment Status"
        withCloseButton={state === 'ready' || state === 'timeout'}
        className="sm:max-w-md"
      >
        {/* Loading State */}
        {state === 'polling' && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={CheckCircle} variant="success" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Payment Successful!</DialogTitle>
              <DialogDescription className="pt-2">
                Your payment was processed successfully.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Activating your subscription...</p>
              </div>
            </div>
          </>
        )}

        {/* Timeout State */}
        {state === 'timeout' && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={Info} variant="default" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Processing Subscription</DialogTitle>
              <DialogDescription className="pt-2">
                Your subscription is being activated.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                This is taking longer than expected. Your subscription will be
                ready shortly.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={onRefresh} variant="outline" className="w-full">
                Check Status
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Success/Ready State - Step 1: Schedule Check-ins */}
        {state === 'ready' && step === 'checkins' && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={Sparkles} variant="amber" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Subscription Activated!</DialogTitle>
              <DialogDescription className="pt-2">
                Track your progress with regular check-ins.
              </DialogDescription>
            </DialogHeader>

            <CheckinScheduleForm
              formData={formData}
              onFormDataChange={setFormData}
              showPreview={true}
            />

            <DialogFooter className="flex-col gap-2">
              <Button
                onClick={handleSaveAndContinue}
                variant="gradient"
                size="lg"
                className="w-full"
                iconStart={<Calendar />}
                loading={isCreating}
              >
                Save & Continue
              </Button>
              <Button
                onClick={handleSkipCheckins}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Success/Ready State - Step 2: Browse Plans */}
        {state === 'ready' && step === 'plans' && (
          <>
            <div className="flex justify-center mb-4">
              <BiggyIcon icon={Sparkles} variant="amber" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle>Explore Training Plans</DialogTitle>
              <DialogDescription className="pt-2">
                Start with a professionally designed training program.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-card-on-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Browse our collection of training plans tailored for different
                goals and experience levels.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button
                onClick={handleBrowsePlans}
                variant="gradient"
                size="lg"
                className="w-full"
                iconStart={<Sparkles />}
              >
                Browse Plans
              </Button>
              <Button
                onClick={handleReturnToApp}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Start Training
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
