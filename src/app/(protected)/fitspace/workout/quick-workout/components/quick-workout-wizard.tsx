import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, SparklesIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { scrollToTop } from '../utils/scroll-utils'

import type { WorkoutCreationLandingProps } from './workout-creation-landing'

// Define different step flows
const MANUAL_STEPS = [
  {
    id: 'muscle-groups',
    title: 'Choose Muscle Groups',
    description: 'Select the muscles you want to target',
  },
  {
    id: 'equipment',
    title: 'Select Equipment',
    description: 'Choose available equipment',
  },
  {
    id: 'exercises',
    title: 'Pick Exercises',
    description: 'Select exercises for your workout',
  },
  {
    id: 'review',
    title: 'Review Workout',
    description: 'Review and start your workout',
  },
]

const AI_STEPS = [
  {
    id: 'ai-muscle-groups',
    title: 'Choose Muscle Groups',
    description: 'Select the muscles you want to target',
  },
  {
    id: 'ai-equipment',
    title: 'Select Equipment',
    description: 'Choose available equipment',
  },
  {
    id: 'ai-parameters',
    title: 'Workout Parameters',
    description: 'Set exercise count and intensity preferences',
  },
  {
    id: 'ai-results',
    title: 'Your Workout',
    description: 'Review and customize your workout',
  },
]

const LANDING_STEP = {
  id: 'landing',
  title: 'Create Your Workout',
  description: "Choose how you'd like to build your workout",
}

export type WorkoutFlow = 'manual' | 'ai' | null

interface QuickWorkoutWizardProps {
  // Component props for each step
  landingComponent?: React.ReactNode
  muscleGroupsComponent?: React.ReactNode
  equipmentComponent?: React.ReactNode
  exercisesComponent?: React.ReactNode
  reviewComponent?: React.ReactNode
  aiMuscleGroupsComponent?: React.ReactNode
  aiEquipmentComponent?: React.ReactNode
  aiParametersComponent?: React.ReactNode
  aiResultsComponent?: React.ReactNode

  // Flow control
  hasExistingWorkout?: boolean
  showLanding?: boolean
  workoutFlow?: WorkoutFlow
  onFlowChange?: (flow: WorkoutFlow) => void

  // Validation functions for each step
  canProceedFromStep?: (step: number) => boolean
  isAdding?: boolean

  // Callbacks
  onFinish?: () => void
  onStepChange?: (step: number) => void
}

export function QuickWorkoutWizard({
  landingComponent,
  muscleGroupsComponent,
  equipmentComponent,
  exercisesComponent,
  reviewComponent,
  aiMuscleGroupsComponent,
  aiEquipmentComponent,
  aiParametersComponent,
  aiResultsComponent,
  hasExistingWorkout = false,
  showLanding = false,
  workoutFlow = null,
  onFlowChange,
  canProceedFromStep = () => true,
  isAdding = false,
  onFinish,
  onStepChange,
}: QuickWorkoutWizardProps) {
  // Determine the current step sequence based on flow
  const getSteps = () => {
    if (showLanding && workoutFlow === null) {
      return [LANDING_STEP]
    }

    switch (workoutFlow) {
      case 'manual':
        return MANUAL_STEPS
      case 'ai':
        return AI_STEPS
      default:
        return MANUAL_STEPS // fallback
    }
  }

  const currentSteps = getSteps()
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (
      currentStep < currentSteps.length - 1 &&
      canProceedFromStep(currentStep)
    ) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
      scrollToTop()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
      scrollToTop()
    } else if (isOnLanding && hasExistingWorkout) {
      // From landing page, go back to existing workout view
      onStepChange?.(-1)
      scrollToTop()
    } else if (hasExistingWorkout) {
      // From step 0 of a flow, go back to existing workout view
      onStepChange?.(-1)
      scrollToTop()
    } else if (workoutFlow !== null && onFlowChange) {
      // Go back to landing page from step 0 of any flow (when landing is available)
      onFlowChange(null)
      setCurrentStep(0)
      scrollToTop()
    }
  }

  const handleFlowSelection = (flow: WorkoutFlow) => {
    onFlowChange?.(flow)
    setCurrentStep(0) // Reset to first step of the new flow
    scrollToTop()
  }

  const handleFinish = () => {
    onFinish?.()
  }

  // Handle landing step special case for progress calculation
  const isOnLanding = showLanding && workoutFlow === null
  const progress = isOnLanding
    ? 0
    : ((currentStep + 1) / currentSteps.length) * 100

  return (
    <div className="bg-background pb-[80px]">
      {/* Header with Progress */}
      {!isOnLanding && (
        <div className="sticky top-[-8px] left-0 right-0 z-50 bg-background px-2">
          <div className="container py-4 space-y-4">
            <div className="text-center mx-auto">
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {currentSteps.length}
              </p>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={cn('container pt-6', isOnLanding && 'pt-12')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${workoutFlow}-${currentStep}`}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                {currentSteps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {currentSteps[currentStep].description}
              </p>
            </div>

            {/* Step Content Container */}
            <div className="min-h-[60vh]">{renderStepContent()}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {!isOnLanding && (
        <div className="bg-background fixed bottom-[72px] left-0 right-0 px-2 z-50">
          <div className="py-2 max-w-screen-sm mx-auto">
            <div className="flex justify-between gap-4">
              <Button
                variant="secondary"
                onClick={prevStep}
                disabled={
                  isOnLanding ||
                  (currentStep === 0 &&
                    !hasExistingWorkout &&
                    (!workoutFlow || !onFlowChange))
                }
                className={cn(
                  'flex-1 bg-transparent transition-opacity',
                  (isOnLanding ||
                    (currentStep === 0 &&
                      !hasExistingWorkout &&
                      (!workoutFlow || !onFlowChange))) &&
                    'opacity-0',
                )}
                iconStart={<ArrowLeft />}
              >
                Previous
              </Button>

              {isOnLanding ? (
                // Hide next button on landing, user must choose flow
                <div className="flex-1" />
              ) : currentStep < currentSteps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  variant={
                    currentSteps[currentStep].id === 'ai-parameters'
                      ? 'gradient'
                      : 'secondary'
                  }
                  disabled={!canProceedFromStep(currentStep)}
                  className="flex-1"
                  iconEnd={
                    currentSteps[currentStep].id === 'ai-parameters' ? (
                      <SparklesIcon className="text-amber-200" />
                    ) : (
                      <ArrowRight />
                    )
                  }
                >
                  {workoutFlow === 'ai' &&
                  currentSteps[currentStep].id === 'ai-parameters'
                    ? 'Generate Workout'
                    : 'Next'}
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  loading={isAdding}
                  iconStart={<Check />}
                  className="flex-1"
                >
                  Start Workout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderStepContent() {
    // Landing step
    if (isOnLanding) {
      // Clone the landing component to pass the flow selection handler
      if (React.isValidElement<WorkoutCreationLandingProps>(landingComponent)) {
        const landingWithProps = React.cloneElement(landingComponent, {
          onSelectManual: () => handleFlowSelection('manual'),
          onSelectAI: () => handleFlowSelection('ai'),
        })
        return <StepContainer>{landingWithProps}</StepContainer>
      }
      return <StepContainer>{landingComponent}</StepContainer>
    }

    // Manual flow steps
    if (workoutFlow === 'manual') {
      const stepId = currentSteps[currentStep].id
      switch (stepId) {
        case 'muscle-groups':
          return <StepContainer>{muscleGroupsComponent}</StepContainer>
        case 'equipment':
          return <StepContainer>{equipmentComponent}</StepContainer>
        case 'exercises':
          return <StepContainer>{exercisesComponent}</StepContainer>
        case 'review':
          return <StepContainer>{reviewComponent}</StepContainer>
        default:
          return null
      }
    }

    // AI flow steps
    if (workoutFlow === 'ai') {
      const stepId = currentSteps[currentStep].id
      switch (stepId) {
        case 'ai-muscle-groups':
          return <StepContainer>{aiMuscleGroupsComponent}</StepContainer>
        case 'ai-equipment':
          return <StepContainer>{aiEquipmentComponent}</StepContainer>
        case 'ai-parameters':
          return <StepContainer>{aiParametersComponent}</StepContainer>
        case 'ai-results':
          return <StepContainer>{aiResultsComponent}</StepContainer>
        default:
          return null
      }
    }

    return null
  }
}

// Container for consistent step styling
function StepContainer({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function QuickWorkoutWizardSkeleton() {
  return (
    <div className="bg-background">
      {/* Header with Progress - showing 0% */}
      <div className="sticky top-[-8px] z-50 bg-background px-2">
        <div className="container py-4 space-y-4">
          <div className="text-center mx-auto">
            <p className="text-sm text-muted-foreground masked-placeholder-text">
              Getting Started
            </p>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <div className="container pt-6">
        <div className="space-y-6">
          {/* Step Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold masked-placeholder-text mx-auto w-max">
              Create Your Workout
            </h2>
            <p className="text-muted-foreground masked-placeholder-text w-max mx-auto">
              Loading...
            </p>
          </div>

          {/* Step Content Container */}
          <div className="min-h-[60vh] space-y-6">
            {/* Main content area skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-background sticky bottom-[72px] -mx-2 px-2 z-50">
        <div className="container py-4">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-10 flex-1 opacity-50" />{' '}
            {/* Previous button (disabled state) */}
            <Skeleton className="h-10 flex-1" /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  )
}
