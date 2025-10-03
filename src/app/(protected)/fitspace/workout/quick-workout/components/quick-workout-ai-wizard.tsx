'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  useFitspaceCreateQuickWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'

import { useAiWorkoutGeneration } from '../hooks/use-ai-workout-generation'

import { AiEquipmentStep } from './ai-equipment-step'
import { AiMuscleGroupsStep } from './ai-muscle-groups-step'
import { AiParametersStep } from './ai-parameters-step'
import { AiResultsStep } from './ai-results-step'

interface QuickWorkoutAiWizardProps {
  open: boolean
  onClose: () => void
  dayId: string
}

type AiStep = 'muscle-groups' | 'equipment' | 'parameters' | 'results'

export function QuickWorkoutAiWizard({
  open,
  onClose,
  dayId,
}: QuickWorkoutAiWizardProps) {
  const [currentStep, setCurrentStep] = useState<AiStep>('muscle-groups')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayIdFromUrl] = useQueryState('day')

  const {
    aiInputData,
    aiWorkoutResult,
    aiGenerationError,
    isGeneratingAiWorkout,
    setAiInputData,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
    handleExercisesReorder,
  } = useAiWorkoutGeneration()

  // Fetch exercises data for muscle groups
  const { data: exercisesData } = useFitspaceGetExercisesQuery()

  // Muscle groups data
  const allMuscleGroups = useMemo(() => {
    return (
      exercisesData?.muscleGroupCategories?.flatMap(
        (category) => category.muscles,
      ) || []
    )
  }, [exercisesData])

  const { mutateAsync: createQuickWorkout, isPending: isCreatingWorkout } =
    useFitspaceCreateQuickWorkoutMutation({
      onSuccess: async () => {
        // Invalidate the ACTUAL query that the component uses
        const currentDayId = dayIdFromUrl || dayId
        const queryKeyToInvalidate = useFitspaceGetWorkoutDayQuery.getKey({
          dayId: currentDayId,
        })

        // Invalidate queries to refresh the data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate }),
          queryClient.invalidateQueries({ queryKey: ['navigation'] }),
          queryClient.invalidateQueries({
            queryKey: ['FitspaceGetQuickWorkoutNavigation'],
          }),
          queryClient.invalidateQueries({ queryKey: ['GetQuickWorkoutPlan'] }),
          queryClient.invalidateQueries({
            queryKey: ['FitspaceGetQuickWorkoutDay'],
          }),
        ])

        // Refetch the day query to ensure fresh data
        await queryClient.refetchQueries({
          queryKey: queryKeyToInvalidate,
        })

        // Refresh server components
        router.refresh()

        // Close the sheet
        onClose()
      },
    })

  const handleNext = () => {
    if (currentStep === 'muscle-groups') {
      setCurrentStep('equipment')
    } else if (currentStep === 'equipment') {
      setCurrentStep('parameters')
    }
  }

  const handleBack = () => {
    if (currentStep === 'equipment') {
      setCurrentStep('muscle-groups')
    } else if (currentStep === 'parameters') {
      setCurrentStep('equipment')
    } else if (currentStep === 'results') {
      setCurrentStep('parameters')
    }
  }

  const handleGenerate = async () => {
    setCurrentStep('results')
    await handleGenerateAiWorkout()
  }

  const handleAccept = async () => {
    if (!aiWorkoutResult) return

    try {
      // Transform AI workout data to the format expected by createQuickWorkout
      const exercises = aiWorkoutResult.exercises.map((aiExercise, index) => ({
        exerciseId: aiExercise.exercise.id,
        order: index + 1,
        sets:
          aiExercise.sets?.map((aiSet, setIndex) => ({
            order: setIndex + 1,
            reps: aiSet?.reps || null,
            minReps: null,
            maxReps: null,
            rpe: aiSet?.rpe || null,
            weight: null,
          })) || [],
      }))

      await createQuickWorkout({
        input: {
          exercises,
          replaceExisting: true,
          dayId, // Add to the specific day the user is viewing
        },
      })
    } catch (error) {
      console.error('Failed to create workout:', error)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'muscle-groups':
        return 'Select Muscle Groups'
      case 'equipment':
        return 'Select Equipment'
      case 'parameters':
        return 'Workout Parameters'
      case 'results':
        return 'Your Workout'
      default:
        return 'Quick Workout'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'muscle-groups':
        return 'Choose which muscles to target or skip this step to let us choose the best full-body workout for you.'
      case 'equipment':
        return 'Select available or preferred equipment'
      case 'parameters':
        return 'Customize your workout intensity'
      case 'results':
        return 'Review and start your workout'
      default:
        return ''
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto gap-0"
      >
        <SheetHeader>
          <SheetTitle>{getStepTitle()}</SheetTitle>
          <SheetDescription>{getStepDescription()}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {currentStep === 'muscle-groups' && (
            <AiMuscleGroupsStep
              muscleGroups={allMuscleGroups}
              data={aiInputData}
              onDataChange={setAiInputData}
            />
          )}

          {currentStep === 'equipment' && (
            <AiEquipmentStep data={aiInputData} onDataChange={setAiInputData} />
          )}

          {currentStep === 'parameters' && (
            <AiParametersStep
              data={aiInputData}
              onDataChange={setAiInputData}
            />
          )}

          {currentStep === 'results' && (
            <AiResultsStep
              data={aiWorkoutResult}
              inputData={aiInputData}
              isLoading={isGeneratingAiWorkout}
              error={aiGenerationError}
              onRetry={handleRetryAiGeneration}
              onExercisesReorder={handleExercisesReorder}
            />
          )}
        </div>

        <SheetFooter className="">
          {currentStep === 'muscle-groups' && (
            <div className="flex gap-2 w-full">
              <Button variant="tertiary" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                iconEnd={<ChevronRight />}
              >
                Equipment
              </Button>
            </div>
          )}

          {currentStep === 'equipment' && (
            <div className="flex gap-2 w-full">
              <Button
                variant="tertiary"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                iconEnd={<ChevronRight />}
              >
                Workout Parameters
              </Button>
            </div>
          )}

          {currentStep === 'parameters' && (
            <div className="flex gap-2 w-full">
              <Button
                variant="tertiary"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                loading={isGeneratingAiWorkout}
                disabled={isGeneratingAiWorkout}
                className="flex-1"
              >
                {isGeneratingAiWorkout ? 'Generating...' : 'Generate Workout'}
              </Button>
            </div>
          )}

          {currentStep === 'results' && !isGeneratingAiWorkout && (
            <div className="flex gap-2 w-full">
              <Button
                variant="tertiary"
                onClick={handleBack}
                disabled={isCreatingWorkout}
                className="flex-1"
              >
                Back
              </Button>
              {aiWorkoutResult && (
                <Button
                  onClick={handleAccept}
                  loading={isCreatingWorkout}
                  disabled={isCreatingWorkout}
                  className="flex-1"
                >
                  Start Workout
                </Button>
              )}
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
