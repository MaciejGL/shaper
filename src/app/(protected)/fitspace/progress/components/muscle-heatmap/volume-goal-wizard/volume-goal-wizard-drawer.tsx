'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

import { Drawer, DrawerContent } from '@/components/ui/drawer'

import type { VolumeGoalWizardDrawerProps, WizardAnswers } from './types'
import { useVolumeGoalWizard } from './use-volume-goal-wizard'
import { getStepIndex, getTotalSteps } from './utils'
import { WizardConfirmationView } from './wizard-confirmation-view'
import { WizardQuestionView } from './wizard-question-view'

export function VolumeGoalWizardDrawer({
  open,
  onOpenChange,
  currentGoal,
  onSelect,
}: VolumeGoalWizardDrawerProps) {
  const {
    step,
    answers,
    currentQuestion,
    isComplete,
    setAnswer,
    goBack,
    reset,
    canGoBack,
    progress,
  } = useVolumeGoalWizard()

  // Reset wizard when drawer closes
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(reset, 300)
      return () => clearTimeout(timeout)
    }
  }, [open, reset])

  const handleConfirm = () => {
    if (answers.focus && answers.commitment) {
      onSelect(answers.focus, answers.commitment)
      onOpenChange(false)
    }
  }

  const stepNumber = getStepIndex(step) + 1
  const totalSteps = getTotalSteps()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Set Volume Goal" className="h-[85vh]">
        <div className="p-4 h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'results' && isComplete ? (
              <WizardConfirmationView
                key="confirmation"
                focusPreset={answers.focus!}
                commitment={answers.commitment!}
                onConfirm={handleConfirm}
                onBack={goBack}
                onRestart={reset}
              />
            ) : currentQuestion ? (
              <WizardQuestionView
                key={currentQuestion.id}
                stepNumber={stepNumber}
                totalSteps={totalSteps}
                progress={progress}
                question={currentQuestion}
                selectedValue={answers[currentQuestion.id as keyof WizardAnswers]}
                onSelect={(value) =>
                  setAnswer(currentQuestion.id as keyof WizardAnswers, value)
                }
                onBack={canGoBack ? goBack : undefined}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
