import { useCallback, useMemo, useState } from 'react'

import type { WizardAnswers, WizardStep } from './types'
import { WIZARD_QUESTIONS } from './utils'

const INITIAL_ANSWERS: WizardAnswers = {
  focus: null,
  commitment: null,
}

export function useVolumeGoalWizard() {
  const [step, setStep] = useState<WizardStep>('focus')
  const [answers, setAnswers] = useState<WizardAnswers>(INITIAL_ANSWERS)
  const [showAllPresets, setShowAllPresets] = useState(false)

  const currentQuestion = useMemo(() => {
    if (step === 'results') return null
    return WIZARD_QUESTIONS.find((q) => q.id === step) ?? null
  }, [step])

  // Check if we have complete answers
  const isComplete = Boolean(answers.focus && answers.commitment)

  const setAnswer = useCallback(
    (questionId: keyof WizardAnswers, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }))

      // Auto-advance to next step after delay (shows selection before transition)
      setTimeout(() => {
        if (questionId === 'focus') {
          setStep('commitment')
        } else if (questionId === 'commitment') {
          setStep('results')
        }
      }, 250)
    },
    [],
  )

  const goBack = useCallback(() => {
    if (showAllPresets) {
      setShowAllPresets(false)
      return
    }

    if (step === 'commitment') {
      setStep('focus')
    } else if (step === 'results') {
      setStep('commitment')
    }
  }, [step, showAllPresets])

  const reset = useCallback(() => {
    setStep('focus')
    setAnswers(INITIAL_ANSWERS)
    setShowAllPresets(false)
  }, [])

  const canGoBack = step !== 'focus' || showAllPresets

  const progress = useMemo(() => {
    const steps: WizardStep[] = ['focus', 'commitment']
    const currentIndex = steps.indexOf(step as WizardStep)
    if (step === 'results') return 100
    return ((currentIndex + 1) / 2) * 100
  }, [step])

  return {
    step,
    answers,
    currentQuestion,
    isComplete,
    showAllPresets,
    setShowAllPresets,
    setAnswer,
    goBack,
    reset,
    canGoBack,
    progress,
  }
}
