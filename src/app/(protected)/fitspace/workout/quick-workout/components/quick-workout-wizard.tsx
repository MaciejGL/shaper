import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STEPS = [
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

interface QuickWorkoutWizardProps {
  // Component props for each step
  muscleGroupsComponent?: React.ReactNode
  equipmentComponent?: React.ReactNode
  exercisesComponent?: React.ReactNode
  reviewComponent?: React.ReactNode
  hasExistingWorkout?: boolean
  // Validation functions for each step
  canProceedFromStep?: (step: number) => boolean
  isAdding?: boolean
  // Callbacks
  onFinish?: () => void
  onStepChange?: (step: number) => void
}

export function QuickWorkoutWizard({
  muscleGroupsComponent,
  equipmentComponent,
  exercisesComponent,
  reviewComponent,
  hasExistingWorkout = false,
  canProceedFromStep = () => true,
  isAdding = false,
  onFinish,
  onStepChange,
}: QuickWorkoutWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceedFromStep(currentStep)) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    } else if (hasExistingWorkout) {
      onStepChange?.(-1)
    }
  }

  const handleFinish = () => {
    onFinish?.()
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="bg-background -mt-2">
      {/* Header with Progress */}
      <div className="sticky top-[-8px] z-50 bg-background px-2">
        <div className="container py-4 space-y-4">
          <div className="text-center mx-auto">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <div className="container pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{STEPS[currentStep].title}</h2>
              <p className="text-muted-foreground">
                {STEPS[currentStep].description}
              </p>
            </div>

            {/* Step Content Container */}
            <div className="min-h-[60vh]">
              {currentStep === 0 && (
                <StepContainer>{muscleGroupsComponent}</StepContainer>
              )}

              {currentStep === 1 && (
                <StepContainer>{equipmentComponent}</StepContainer>
              )}

              {currentStep === 2 && (
                <StepContainer>{exercisesComponent}</StepContainer>
              )}

              {currentStep === 3 && (
                <StepContainer>{reviewComponent}</StepContainer>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-background sticky bottom-[64px] -mx-2 px-2 z-50">
        <div className="py-4">
          <div className="flex justify-between gap-4">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0 && !hasExistingWorkout}
              className={cn(
                'flex-1 bg-transparent transition-opacity',
                currentStep === 0 && !hasExistingWorkout && 'opacity-0',
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={nextStep}
                variant="secondary"
                disabled={!canProceedFromStep(currentStep)}
                className="flex-1"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
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
    </div>
  )
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
              Step 1 of {STEPS.length}
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
              {STEPS[0].title}
            </h2>
            <p className="text-muted-foreground masked-placeholder-text w-max mx-auto">
              {STEPS[0].description}
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
