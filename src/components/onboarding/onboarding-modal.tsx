'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  GQLFitnessLevel,
  GQLGoal,
  GQLHeightUnit,
  GQLTrainingView,
  GQLWeightUnit,
  useUpdateProfileMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { BasicInfoStep } from './steps/basic-info-step'
import { FitnessProfileStep } from './steps/fitness-profile-step'
import { PreferencesStep } from './steps/preferences-step'
import { WelcomeStep } from './steps/welcome-step'
import { WhatsNextStep } from './steps/whats-next-step'

export type OnboardingPath = 'setup' | 'training' | null

export interface OnboardingData {
  firstName: string
  lastName: string
  birthday?: string
  sex?: string
  fitnessLevel?: GQLFitnessLevel
  goals: GQLGoal[]
  height?: number
  weight?: number
  weightUnit: GQLWeightUnit
  heightUnit: GQLHeightUnit
  trainingView: GQLTrainingView
}

const SETUP_STEPS = [
  'welcome',
  'basic-info',
  'fitness-profile',
  'preferences',
  'whats-next',
] as const
const TRAINING_STEPS = ['welcome', 'training-choice'] as const

type SetupStep = (typeof SETUP_STEPS)[number]
type TrainingStep = (typeof TRAINING_STEPS)[number]
type Step = SetupStep | TrainingStep

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [path, setPath] = useState<OnboardingPath>(null)
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    goals: [],
    weightUnit: GQLWeightUnit.Kg,
    heightUnit: GQLHeightUnit.Cm,
    trainingView: GQLTrainingView.Advanced,
  })

  const updateProfile = useUpdateProfileMutation({
    onSuccess: () => {
      onClose()
    },
  })

  const steps =
    path === 'setup'
      ? SETUP_STEPS
      : path === 'training'
        ? TRAINING_STEPS
        : ['welcome']
  const currentStepIndex = steps.findIndex((step) => step === currentStep)
  const totalSteps = steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex] as Step)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex] as Step)
    } else if (currentStep !== 'welcome') {
      setCurrentStep('welcome')
      setPath(null)
    }
  }

  const handlePathSelection = (selectedPath: OnboardingPath) => {
    setPath(selectedPath)
    if (selectedPath === 'setup') {
      setCurrentStep('basic-info')
    } else if (selectedPath === 'training') {
      setCurrentStep('training-choice')
    }
  }

  const handleTrainingChoice = (choice: 'custom' | 'plans' | 'trainer') => {
    // Mark onboarding as completed
    updateProfile.mutate({
      input: {
        hasCompletedOnboarding: true,
      },
    })

    // Navigate based on choice
    switch (choice) {
      case 'custom':
        router.push('/fitspace/workout/quick-workout')
        break
      case 'plans':
        router.push('/fitspace/explore?tab=training-plans')
        break
      case 'trainer':
        router.push('/fitspace/explore?tab=trainers')
        break
    }
  }

  const handleComplete = () => {
    // Update profile with all collected data
    updateProfile.mutate({
      input: {
        ...data,
        hasCompletedOnboarding: true,
      },
    })
  }

  const handleQuickStart = () => {
    // Mark onboarding as completed and go to workout
    updateProfile.mutate({
      input: {
        hasCompletedOnboarding: true,
      },
    })
    router.push('/fitspace/workout')
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 'basic-info':
        return data.firstName.trim() && data.lastName.trim()
      case 'fitness-profile':
        return data.fitnessLevel && data.goals.length > 0
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            onPathSelect={handlePathSelection}
            onQuickStart={handleQuickStart}
          />
        )
      case 'basic-info':
        return (
          <BasicInfoStep
            data={data}
            onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
          />
        )
      case 'fitness-profile':
        return (
          <FitnessProfileStep
            data={data}
            onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
          />
        )
      case 'preferences':
        return (
          <PreferencesStep
            data={data}
            onChange={(updates) => setData((prev) => ({ ...prev, ...updates }))}
          />
        )
      case 'whats-next':
        return (
          <WhatsNextStep
            onChoice={handleTrainingChoice}
            onComplete={handleComplete}
          />
        )
      case 'training-choice':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                How would you like to train?
              </h2>
              <p className="text-muted-foreground">
                Choose your preferred way to get started
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleTrainingChoice('custom')}
                variant="outline"
                className="w-full h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Build Custom Workout</div>
                  <div className="text-sm text-muted-foreground">
                    Create your own workout with our wizard
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => handleTrainingChoice('plans')}
                variant="outline"
                className="w-full h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Browse Training Plans</div>
                  <div className="text-sm text-muted-foreground">
                    Explore structured workout programs
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => handleTrainingChoice('trainer')}
                variant="outline"
                className="w-full h-auto p-4 justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">Find a Trainer</div>
                  <div className="text-sm text-muted-foreground">
                    Get personalized coaching
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        dialogTitle="Welcome to Hypertro"
        className={cn(
          'sm:max-w-lg max-h-[90vh] overflow-y-auto',
          'md:max-w-xl',
        )}
        withCloseButton={false}
      >
        <div className="space-y-6">
          {/* Progress Bar */}
          {path && currentStep !== 'welcome' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {path &&
            currentStep !== 'welcome' &&
            currentStep !== 'whats-next' &&
            currentStep !== 'training-choice' && (
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  disabled={updateProfile.isPending}
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleNext}
                    variant="ghost"
                    size="sm"
                    disabled={updateProfile.isPending}
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={
                      currentStep === 'preferences'
                        ? handleComplete
                        : handleNext
                    }
                    disabled={!canGoNext() || updateProfile.isPending}
                    size="sm"
                  >
                    {currentStep === 'preferences' ? (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Complete
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
