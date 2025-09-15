'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  GQLFitnessLevel,
  GQLGoal,
  GQLHeightUnit,
  GQLTrainingView,
  GQLUpdateProfileInput,
  GQLUserBasicQuery,
  GQLWeightUnit,
  useUpdateProfileMutation,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { BasicInfoStep } from './steps/basic-info-step'
import { FitnessProfileStep } from './steps/fitness-profile-step'
import { PhysicalStatsStep } from './steps/physical-stats-step'
import { PreferencesStep } from './steps/preferences-step'
import { QuickWorkoutChoiceStep } from './steps/quick-workout-choice-step'
import { TrainingChoiceStep } from './steps/training-choice-step'
import { WelcomeStep } from './steps/welcome-step'

export type OnboardingPath = 'setup' | 'training' | 'quick-workout' | null

// Move initial state outside component to prevent Fast Refresh resets
const INITIAL_ONBOARDING_DATA: OnboardingData = {
  firstName: '',
  lastName: '',
  avatarUrl: '',
  goals: [],
  weightUnit: GQLWeightUnit.Kg,
  heightUnit: GQLHeightUnit.Cm,
  trainingView: GQLTrainingView.Simple,
}

export interface OnboardingData {
  firstName: string
  lastName: string
  avatarUrl: string
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
  'physical-stats',
  'fitness-profile',
  'preferences',
  'training-choice',
] as const
const TRAINING_STEPS = ['welcome', 'training-choice'] as const
const QUICK_WORKOUT_STEPS = ['welcome', 'quick-workout-choice'] as const

type SetupStep = (typeof SETUP_STEPS)[number]
type TrainingStep = (typeof TRAINING_STEPS)[number]
type QuickWorkoutStep = (typeof QUICK_WORKOUT_STEPS)[number]
type Step = SetupStep | TrainingStep | QuickWorkoutStep

interface OnboardingModalProps {
  open: boolean
  markOnboardingCompleted?: () => void
}

export function OnboardingModal({
  open,
  markOnboardingCompleted,
}: OnboardingModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [path, setPath] = useState<OnboardingPath>(null)

  // Use stable initial state reference to prevent Fast Refresh resets
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA)
  const [trainingChoice, setTrainingChoice] = useState<
    'custom' | 'plans' | 'trainer'
  >('custom')

  const updateProfile = useUpdateProfileMutation({
    onError: (error) => {
      console.error('Failed to save onboarding data:', error)
      toast.error('Something went wrong with updating your account')
    },
  })

  const steps = useMemo(
    () =>
      path === 'setup'
        ? SETUP_STEPS
        : path === 'training'
          ? TRAINING_STEPS
          : path === 'quick-workout'
            ? QUICK_WORKOUT_STEPS
            : ['welcome'],
    [path],
  )

  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step === currentStep),
    [steps, currentStep],
  )

  // Calculate progress excluding welcome step
  const isWelcomeStep = currentStep === 'welcome'
  const { progress } = useMemo(() => {
    const progressSteps = steps.filter((step) => step !== 'welcome')
    const currentProgressIndex = progressSteps.findIndex(
      (step) => step === currentStep,
    )
    const totalProgressSteps = progressSteps.length
    const progress = isWelcomeStep
      ? 0
      : ((currentProgressIndex + 1) / totalProgressSteps) * 100

    return {
      progress,
    }
  }, [steps, currentStep, isWelcomeStep])

  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex] as Step)
    }
  }, [currentStepIndex, steps])

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex] as Step)
    } else if (currentStep !== 'welcome') {
      setCurrentStep('welcome')
      setPath(null)
    }
  }, [currentStepIndex, steps, currentStep])

  const handlePathSelection = useCallback((selectedPath: OnboardingPath) => {
    setPath(selectedPath)
    if (selectedPath === 'setup') {
      setCurrentStep('basic-info')
    } else if (selectedPath === 'training') {
      setCurrentStep('training-choice')
    } else if (selectedPath === 'quick-workout') {
      setCurrentStep('quick-workout-choice')
    }
  }, [])

  const handleTrainingChoice = useCallback(
    (choice: 'custom' | 'plans' | 'trainer') => {
      // Determine navigation path based on choice
      let navigationPath: string
      switch (choice) {
        case 'custom':
          navigationPath = '/fitspace/workout'
          break
        case 'plans':
          navigationPath = '/fitspace/explore?tab=training-plans'
          break
        case 'trainer':
          navigationPath = '/fitspace/explore?tab=trainers'
          break
      }

      // 1. BULLETPROOF: Mark onboarding completed locally first
      markOnboardingCompleted?.()

      // 2. Navigate immediately for instant UX
      router.push(navigationPath)

      // 3. Update cache immediately to sync UI
      const queryKey = useUserBasicQuery.getKey({})
      queryClient.setQueryData(
        queryKey,
        (old: GQLUserBasicQuery | undefined) => {
          if (!old?.userBasic?.profile) return old

          return {
            ...old,
            userBasic: {
              ...old.userBasic,
              profile: {
                ...old.userBasic.profile,
                hasCompletedOnboarding: true,
                firstName:
                  data.firstName.trim() || old.userBasic.profile.firstName,
                lastName:
                  data.lastName.trim() || old.userBasic.profile.lastName,
                birthday: data.birthday || old.userBasic.profile.birthday,
                sex: data.sex || old.userBasic.profile.sex,
                avatarUrl: data.avatarUrl || old.userBasic.profile.avatarUrl,
              },
            },
          }
        },
      )

      // 4. Prepare and send update to server in background
      const updateInput: GQLUpdateProfileInput = {
        hasCompletedOnboarding: true,
        trainingView: data.trainingView,
        weightUnit: data.weightUnit,
        heightUnit: data.heightUnit,
      }

      // Map onboarding data to profile fields
      if (data.firstName.trim()) {
        updateInput.firstName = data.firstName.trim()
      }
      if (data.lastName.trim()) {
        updateInput.lastName = data.lastName.trim()
      }
      if (data.birthday) {
        updateInput.birthday = data.birthday
      }
      if (data.sex) {
        updateInput.sex = data.sex
      }
      if (data.fitnessLevel) {
        updateInput.fitnessLevel = data.fitnessLevel
      }
      if (data.goals.length > 0) {
        updateInput.goals = data.goals
      }
      if (data.height) {
        updateInput.height = data.height
      }
      if (data.weight) {
        updateInput.weight = data.weight
      }
      if (data.avatarUrl) {
        updateInput.avatarUrl = data.avatarUrl
      }

      // Save to server in background
      updateProfile.mutate({
        input: updateInput,
      })
    },
    [markOnboardingCompleted, router, queryClient, data, updateProfile],
  )

  const handleQuickStart = useCallback(() => {
    // Navigate to quick workout choice step instead of directly to workout
    setPath('quick-workout')
    setCurrentStep('quick-workout-choice')
  }, [])

  // Memoized data update handler for stable reference
  const handleDataUpdate = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleTrainingChoiceChange = useCallback((value: string) => {
    setTrainingChoice(value as 'custom' | 'plans' | 'trainer')
  }, [])

  const handleQuickWorkoutChoice = useCallback(
    (choice: 'custom' | 'plans') => {
      // Determine navigation path based on choice
      let navigationPath: string
      if (choice === 'custom') {
        navigationPath = '/fitspace/workout'
      } else {
        navigationPath = '/fitspace/explore?tab=training-plans'
      }

      // 1. BULLETPROOF: Mark onboarding completed locally first
      markOnboardingCompleted?.()

      // 2. Navigate immediately for instant UX
      router.push(navigationPath)

      // 3. Update cache immediately to sync UI
      const queryKey = useUserBasicQuery.getKey({})
      queryClient.setQueryData(
        queryKey,
        (old: GQLUserBasicQuery | undefined) => {
          if (!old?.userBasic?.profile) return old

          return {
            ...old,
            userBasic: {
              ...old.userBasic,
              profile: {
                ...old.userBasic.profile,
                hasCompletedOnboarding: true,
                firstName:
                  data.firstName.trim() || old.userBasic.profile.firstName,
                lastName:
                  data.lastName.trim() || old.userBasic.profile.lastName,
              },
            },
          }
        },
      )

      // 4. Prepare and send update to server in background
      const updateInput: GQLUpdateProfileInput = {
        hasCompletedOnboarding: true,
        trainingView: data.trainingView,
        weightUnit: data.weightUnit,
        heightUnit: data.heightUnit,
      }

      // Map any available onboarding data
      if (data.firstName.trim()) {
        updateInput.firstName = data.firstName.trim()
      }
      if (data.lastName.trim()) {
        updateInput.lastName = data.lastName.trim()
      }
      if (data.avatarUrl) {
        updateInput.avatarUrl = data.avatarUrl
      }
      // Save to server in background
      updateProfile.mutate({
        input: updateInput,
      })
    },
    [markOnboardingCompleted, router, queryClient, data, updateProfile],
  )

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        fullScreen
        dialogTitle="Welcome to Hypro"
        className="p-0"
        withCloseButton={false}
      >
        <div className={cn('grid grid-rows-[auto_1fr_auto] h-full')}>
          {/* Progress Bar - Hidden on welcome step and quick-workout-choice step */}
          <div
            className={cn(
              'space-y-2 p-4 transition-opacity duration-300 pb-10',
              (isWelcomeStep || currentStep === 'quick-workout-choice') &&
                'opacity-0',
            )}
          >
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4"
            >
              {currentStep === 'welcome' ? (
                <WelcomeStep
                  onPathSelect={handlePathSelection}
                  onQuickStart={handleQuickStart}
                />
              ) : null}
              {currentStep === 'basic-info' ? (
                <BasicInfoStep data={data} onChange={handleDataUpdate} />
              ) : null}
              {currentStep === 'physical-stats' ? (
                <PhysicalStatsStep data={data} onChange={handleDataUpdate} />
              ) : null}
              {currentStep === 'fitness-profile' ? (
                <FitnessProfileStep data={data} onChange={handleDataUpdate} />
              ) : null}
              {currentStep === 'preferences' ? (
                <PreferencesStep data={data} onChange={handleDataUpdate} />
              ) : null}
              {currentStep === 'training-choice' ? (
                <TrainingChoiceStep
                  trainingChoice={trainingChoice}
                  onTrainingChoiceChange={handleTrainingChoiceChange}
                />
              ) : null}
              {currentStep === 'quick-workout-choice' ? (
                <QuickWorkoutChoiceStep
                  onWorkoutChoice={handleQuickWorkoutChoice}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="min-h-20 flex flex-col justify-end">
            {path && currentStep !== 'welcome' && (
              <div className="flex items-center justify-between p-4">
                <Button
                  onClick={handleBack}
                  variant="tertiary"
                  disabled={updateProfile.isPending}
                  iconStart={<ArrowLeft />}
                >
                  Back
                </Button>

                {currentStep !== 'quick-workout-choice' ? (
                  <Button
                    onClick={
                      currentStep === 'training-choice'
                        ? () => handleTrainingChoice(trainingChoice)
                        : handleNext
                    }
                    variant={
                      currentStep === 'training-choice' ? 'gradient' : 'default'
                    }
                    iconStart={
                      currentStep === 'training-choice' ? (
                        <Sparkles />
                      ) : undefined
                    }
                    iconEnd={
                      currentStep !== 'training-choice' ? (
                        <ArrowRight />
                      ) : undefined
                    }
                  >
                    {currentStep === 'training-choice' ? (
                      <>Complete</>
                    ) : (
                      <>Continue</>
                    )}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
