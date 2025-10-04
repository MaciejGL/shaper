'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { ChallengesStep } from './steps/challenges-step'
import { FitnessLevelStep } from './steps/fitness-level-step'
import { GoalsStep } from './steps/goals-step'
import { NutritionStep } from './steps/nutrition-step'
import { PreferencesStep } from './steps/preferences-step'
import { RecoveryStep } from './steps/recovery-step'
import { WelcomeStep } from './steps/welcome-step'
import { ClientSurveyData, INITIAL_SURVEY_DATA } from './types'

const STEPS = [
  'welcome',
  'fitness-level',
  'goals',
  'preferences',
  'nutrition',
  'recovery',
  'challenges',
] as const

type Step = (typeof STEPS)[number]

interface ClientSurveyModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: ClientSurveyData) => Promise<void>
  existingSurvey?: ClientSurveyData
  isSubmitting?: boolean
}

export function ClientSurveyModal({
  open,
  onClose,
  onSubmit,
  existingSurvey,
  isSubmitting: externalIsSubmitting = false,
}: ClientSurveyModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [data, setData] = useState<ClientSurveyData>(INITIAL_SURVEY_DATA)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Initialize data with existing survey when it's available
  useEffect(() => {
    if (existingSurvey && open) {
      setData(existingSurvey)
    }
  }, [existingSurvey, open])

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((step) => step === currentStep),
    [currentStep],
  )

  const isWelcomeStep = currentStep === 'welcome'
  const isLastStep = currentStep === 'challenges'

  // Calculate progress excluding welcome step
  const progress = useMemo(() => {
    const progressSteps = STEPS.filter((step) => step !== 'welcome')
    const currentProgressIndex = progressSteps.findIndex(
      (step) => step === currentStep,
    )
    return isWelcomeStep
      ? 0
      : ((currentProgressIndex + 1) / progressSteps.length) * 100
  }, [currentStep, isWelcomeStep])

  const handleDataUpdate = useCallback((updates: Partial<ClientSurveyData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }, [currentStepIndex])

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }, [currentStepIndex])

  const handleStart = useCallback(() => {
    setCurrentStep('fitness-level')
  }, [])

  const handleSkip = useCallback(() => {
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) {
      onClose()
      return
    }

    try {
      await onSubmit(data)
      // onClose is called by the hook after successful submission
    } catch (error) {
      console.error('Error submitting survey:', error)
    }
  }, [data, onSubmit, onClose])

  const handleClose = useCallback(() => {
    // Reset state when closing
    setCurrentStep('welcome')
    setData(INITIAL_SURVEY_DATA)
    onClose()
  }, [onClose])

  // Scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex flex-col p-0 gap-0 overflow-hidden"
        withCloseButton={!isWelcomeStep}
        dialogTitle="Client Fitness Assessment"
        fullScreen
      >
        {/* Progress Bar - Hide on welcome step */}
        {!isWelcomeStep && (
          <div className="pl-6 pr-12 py-5">
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {currentStep === 'welcome' && (
                <WelcomeStep onStart={handleStart} onSkip={handleSkip} />
              )}
              {currentStep === 'fitness-level' && (
                <FitnessLevelStep data={data} onChange={handleDataUpdate} />
              )}
              {currentStep === 'goals' && (
                <GoalsStep data={data} onChange={handleDataUpdate} />
              )}
              {currentStep === 'preferences' && (
                <PreferencesStep data={data} onChange={handleDataUpdate} />
              )}
              {currentStep === 'nutrition' && (
                <NutritionStep data={data} onChange={handleDataUpdate} />
              )}
              {currentStep === 'recovery' && (
                <RecoveryStep data={data} onChange={handleDataUpdate} />
              )}
              {currentStep === 'challenges' && (
                <ChallengesStep data={data} onChange={handleDataUpdate} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation - Hide on welcome step */}
        {!isWelcomeStep && (
          <div
            className={cn(
              'flex gap-2 px-6 py-3 border-t',
              currentStepIndex === 1 ? 'justify-end' : 'justify-between',
            )}
          >
            {currentStepIndex > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                iconStart={<ArrowLeft />}
              >
                Back
              </Button>
            )}

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={externalIsSubmitting}
                loading={externalIsSubmitting}
                iconStart={<CheckCircle />}
              >
                Complete Survey
              </Button>
            ) : (
              <Button onClick={handleNext} iconEnd={<ArrowRight />}>
                Next
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
