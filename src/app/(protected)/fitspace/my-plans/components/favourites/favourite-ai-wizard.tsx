'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
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
import { useFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import { useUpdateFavouriteWorkout } from '@/hooks/use-favourite-workouts'

import { AiEquipmentStep } from '../../../workout/quick-workout/components/ai-equipment-step'
import { AiMuscleGroupsStep } from '../../../workout/quick-workout/components/ai-muscle-groups-step'
import { AiParametersStep } from '../../../workout/quick-workout/components/ai-parameters-step'
import { AiResultsStep } from '../../../workout/quick-workout/components/ai-results-step'
import { useAiWorkoutGeneration } from '../../../workout/quick-workout/hooks/use-ai-workout-generation'

interface FavouriteAiWizardProps {
  open: boolean
  onClose: () => void
  favouriteId: string
  favouriteTitle: string
}

type AiStep = 'muscle-groups' | 'equipment' | 'parameters' | 'results'

export function FavouriteAiWizard({
  open,
  onClose,
  favouriteId,
  favouriteTitle,
}: FavouriteAiWizardProps) {
  const [currentStep, setCurrentStep] = useState<AiStep>('muscle-groups')
  const queryClient = useQueryClient()

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

  const { mutateAsync: updateFavourite, isPending: isUpdating } =
    useUpdateFavouriteWorkout()

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
      // Transform AI workout data to favourite format
      const exercises = aiWorkoutResult.exercises.map((aiExercise, index) => ({
        name: aiExercise.exercise.name,
        order: index + 1,
        baseId: aiExercise.exercise.id,
        restSeconds: null,
        instructions: null,
        sets:
          aiExercise.sets?.map((aiSet, setIndex) => ({
            order: setIndex + 1,
            reps: aiSet?.reps || null,
            minReps: aiSet?.minReps || null,
            maxReps: aiSet?.maxReps || null,
            rpe: aiSet?.rpe || null,
            weight: null,
          })) || [],
      }))

      await updateFavourite({
        input: {
          id: favouriteId,
          exercises,
        },
      })

      // Invalidate queries
      await queryClient.invalidateQueries({
        queryKey: ['GetFavouriteWorkouts'],
      })

      onClose()
    } catch (error) {
      console.error('Failed to update favourite workout:', error)
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
        return `${favouriteTitle} - AI Generated`
      default:
        return 'Generate Workout'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'muscle-groups':
        return 'Choose which muscles to target'
      case 'equipment':
        return 'Select available equipment'
      case 'parameters':
        return 'Customize workout intensity'
      case 'results':
        return 'Review and save your workout'
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
                Parameters
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
                {isGeneratingAiWorkout ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          )}

          {currentStep === 'results' && !isGeneratingAiWorkout && (
            <div className="flex gap-2 w-full">
              <Button
                variant="tertiary"
                onClick={handleBack}
                disabled={isUpdating}
                className="flex-1"
              >
                Back
              </Button>
              {aiWorkoutResult && (
                <Button
                  onClick={handleAccept}
                  loading={isUpdating}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Save to Template
                </Button>
              )}
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
