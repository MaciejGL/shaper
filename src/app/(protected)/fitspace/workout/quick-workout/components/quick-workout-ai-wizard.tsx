'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EQUIPMENT_OPTIONS, equipmentImages } from '@/constants/equipment'
import {
  useFitspaceCreateQuickWorkoutMutation,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { useUpdateFavouriteWorkout } from '@/hooks/use-favourite-workouts'
import { queryInvalidation } from '@/lib/query-invalidation'

import { useAiWorkoutGeneration } from '../hooks/use-ai-workout-generation'

import { AiEquipmentStep } from './ai-equipment-step'
import { AiParametersStep } from './ai-parameters-step'
import { AiResultsStep } from './ai-results-step'
import { AiWorkoutTypeStep } from './ai-workout-type-step'

type QuickWorkoutAiWizardProps =
  | {
      mode: 'quick-workout'
      open: boolean
      onClose: () => void
      dayId: string
    }
  | {
      mode: 'favourite'
      open: boolean
      onClose: () => void
      favouriteId: string
      favouriteTitle: string
    }

type AiStep = 'workout-type' | 'equipment' | 'parameters' | 'results'

export function QuickWorkoutAiWizard(props: QuickWorkoutAiWizardProps) {
  const { open, onClose } = props
  const [currentStep, setCurrentStep] = useState<AiStep>('workout-type')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayIdFromUrl] = useQueryState('day')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const {
    aiInputData,
    aiWorkoutResult,
    selectedVariant,
    selectedVariantIndex,
    aiGenerationError,
    isGeneratingAiWorkout,
    setAiInputData,
    setSelectedVariantIndex,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
    handleExercisesReorder,
  } = useAiWorkoutGeneration()

  const { mutateAsync: createQuickWorkout, isPending: isCreatingWorkout } =
    useFitspaceCreateQuickWorkoutMutation({
      onSuccess: async () => {
        // Invalidate all workout-related queries
        await queryInvalidation.workoutAndPlans(queryClient)

        // Refetch the specific day query to ensure fresh data
        if (props.mode === 'quick-workout') {
          const currentDayId = dayIdFromUrl || props.dayId
          const queryKeyToInvalidate = useFitspaceGetWorkoutDayQuery.getKey({
            dayId: currentDayId,
          })
          await queryClient.refetchQueries({
            queryKey: queryKeyToInvalidate,
          })
        }

        // Refresh server components
        router.refresh()

        // Close the sheet
        onClose()
      },
    })

  const { mutateAsync: updateFavourite, isPending: isUpdating } =
    useUpdateFavouriteWorkout()

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  const handleNext = () => {
    if (currentStep === 'workout-type') {
      setCurrentStep('equipment')
    } else if (currentStep === 'equipment') {
      setCurrentStep('parameters')
    }
    scrollToTop()
  }

  const handleBack = () => {
    if (currentStep === 'equipment') {
      setCurrentStep('workout-type')
    } else if (currentStep === 'parameters') {
      setCurrentStep('equipment')
    } else if (currentStep === 'results') {
      setCurrentStep('parameters')
    }
    scrollToTop()
  }

  const handleGenerate = async () => {
    setCurrentStep('results')
    scrollToTop()
    await handleGenerateAiWorkout()
  }

  const handleAccept = async () => {
    if (!selectedVariant) return

    try {
      if (props.mode === 'quick-workout') {
        // Transform selected variant to the format expected by createQuickWorkout
        const exercises = selectedVariant.exercises.map(
          (aiExercise, index) => ({
            exerciseId: aiExercise.exercise.id,
            order: index + 1,
            sets:
              aiExercise.sets?.map((aiSet, setIndex) => ({
                order: setIndex + 1,
                reps: aiSet?.reps || null,
                minReps: aiSet?.minReps || null,
                maxReps: aiSet?.maxReps || null,
                rpe: aiSet?.rpe || null,
                weight: null,
              })) || [],
          }),
        )

        await createQuickWorkout({
          input: {
            exercises,
            replaceExisting: true,
            dayId: props.dayId,
          },
        })
      } else {
        // Transform selected variant to favourite format
        const exercises = selectedVariant.exercises.map(
          (aiExercise, index) => ({
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
          }),
        )

        await updateFavourite({
          input: {
            id: props.favouriteId,
            exercises,
          },
        })

        // Invalidate favourite queries
        await queryClient.invalidateQueries({
          queryKey: ['GetFavouriteWorkouts'],
        })

        onClose()
      }
    } catch (error) {
      console.error('Failed to save workout:', error)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'workout-type':
        return 'Choose Workout Type'
      case 'equipment':
        return 'Select Equipment'
      case 'parameters':
        return 'Workout Parameters'
      case 'results':
        return props.mode === 'favourite'
          ? `${props.favouriteTitle} - Generated Workout`
          : 'Your Workout'
      default:
        return 'Quick Workout'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'workout-type':
        return 'Choose your workout style for personalized exercise selection'
      case 'equipment':
        return props.mode === 'favourite'
          ? 'Select available equipment'
          : 'Select available or preferred equipment'
      case 'parameters':
        return props.mode === 'favourite'
          ? 'Customize workout intensity'
          : 'Customize your workout intensity'
      case 'results':
        return props.mode === 'favourite'
          ? 'Review and save your workout'
          : 'Review and start your workout'
      default:
        return ''
    }
  }

  const isPending =
    props.mode === 'quick-workout' ? isCreatingWorkout : isUpdating
  const finalButtonText =
    props.mode === 'favourite' ? 'Save to Template' : 'Start Workout'

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto gap-0 bg-white dark:bg-background"
      >
        {/* Invisible focus trap - captures initial focus to prevent button auto-focus */}
        <div
          tabIndex={0}
          className="sr-only"
          aria-hidden="true"
          onFocus={(e) => e.currentTarget.blur()}
        />

        {/* Hidden preloader for equipment images - loads images into cache */}
        <div className="hidden">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <Image
              key={equipment.value}
              src={equipmentImages[equipment.value]}
              alt={equipment.label}
              width={200}
              height={200}
              priority
            />
          ))}
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          <SheetHeader className="pt-8 pb-4 mb-4">
            <SheetTitle className="text-center">{getStepTitle()}</SheetTitle>
            <SheetDescription className="text-center">
              {getStepDescription()}
            </SheetDescription>
          </SheetHeader>

          {currentStep === 'workout-type' && (
            <AiWorkoutTypeStep
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
              selectedVariantIndex={selectedVariantIndex}
              onSelectVariant={setSelectedVariantIndex}
              isLoading={isGeneratingAiWorkout}
              error={aiGenerationError}
              onRetry={handleRetryAiGeneration}
              onExercisesReorder={handleExercisesReorder}
            />
          )}
        </div>

        <SheetFooter className=" border-t empty:hidden">
          {currentStep === 'workout-type' && (
            <div className="flex gap-2 w-full">
              <Button variant="tertiary" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
                iconEnd={<ChevronRight />}
                disabled={
                  !aiInputData.workoutType ||
                  (aiInputData.workoutType !== 'fullbody' &&
                    !aiInputData.workoutSubType)
                }
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
                disabled={isPending}
                className="flex-1"
              >
                Back
              </Button>
              {aiWorkoutResult && (
                <Button
                  onClick={handleAccept}
                  loading={isPending}
                  disabled={isPending}
                  className="flex-1"
                >
                  {finalButtonText}
                </Button>
              )}
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
