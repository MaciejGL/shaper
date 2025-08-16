'use client'

import { useMemo, useState } from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import {
  useCreateFavouriteFromAI,
  useCreateFavouriteFromManual,
} from '@/hooks/use-favourite-workouts'
import { cn } from '@/lib/utils'

import { AiEquipmentStep } from '../../../workout/quick-workout/components/ai-equipment-step'
import { AiMuscleGroupsStep } from '../../../workout/quick-workout/components/ai-muscle-groups-step'
import { AiParametersStep } from '../../../workout/quick-workout/components/ai-parameters-step'
import { AiResultsStep } from '../../../workout/quick-workout/components/ai-results-step'
import { ManualEquipmentStep } from '../../../workout/quick-workout/components/manual-equipment-step'
import { ManualExercisesStep } from '../../../workout/quick-workout/components/manual-exercises-step'
// Import step components
import { ManualMuscleGroupsStep } from '../../../workout/quick-workout/components/manual-muscle-groups-step'
import { ManualReviewStep } from '../../../workout/quick-workout/components/manual-review-step'
// Import workflow components
import {
  QuickWorkoutWizard,
  WorkoutFlow,
} from '../../../workout/quick-workout/components/quick-workout-wizard'
import { WorkoutCreationLanding } from '../../../workout/quick-workout/components/workout-creation-landing'
import { useAiWorkoutGeneration } from '../../../workout/quick-workout/hooks/use-ai-workout-generation'
// Import hooks
import { useManualWorkout } from '../../../workout/quick-workout/hooks/use-manual-workout'

interface CreateFavouriteModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateFavouriteModal({
  open,
  onClose,
  onSuccess,
}: CreateFavouriteModalProps) {
  // Workout flow state
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlow>(null)
  const [title, setTitle] = useState('')
  const [showTitleStep, setShowTitleStep] = useState(true)

  // Data fetching
  const { data: exercisesData } = useFitspaceGetExercisesQuery()

  // Muscle groups data
  const allMuscleGroups = useMemo(() => {
    return (
      exercisesData?.muscleGroupCategories?.flatMap(
        (category) => category.muscles,
      ) || []
    )
  }, [exercisesData])

  const allExercises = useMemo(() => {
    return [
      ...(exercisesData?.getExercises.trainerExercises || []),
      ...(exercisesData?.getExercises.publicExercises || []),
    ]
  }, [exercisesData])

  // Manual workout data hooks (reuse existing logic)
  const {
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedEquipment,
    setSelectedEquipment,
    selectedExercises,
    handleExerciseSelect,
    searchTerm,
    setSearchTerm,
    selectedExerciseObjects,
    handleReorderExercises,
    handleRemoveExercise,
    canProceedToReview,
    filteredExercises,
  } = useManualWorkout({ allExercises })

  // AI workflow hooks
  const {
    aiInputData,
    setAiInputData,
    aiWorkoutResult,
    isGeneratingAiWorkout,
    aiGenerationError,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
    handleExercisesReorder,
  } = useAiWorkoutGeneration()

  // Favourite creation hooks
  const { createFromManual, isCreating: isCreatingManual } =
    useCreateFavouriteFromManual()
  const { createFromAI, isCreating: isCreatingAI } = useCreateFavouriteFromAI()

  const isCreating = isCreatingManual || isCreatingAI

  // Handle workflow selection
  const handleSelectManual = () => {
    setWorkoutFlow('manual')
    setShowTitleStep(false)
  }

  const handleSelectAI = () => {
    setWorkoutFlow('ai')
    setShowTitleStep(false)
  }

  // Handle workflow changes - go back to title step when flow is reset to null
  const handleFlowChange = (flow: WorkoutFlow) => {
    if (flow === null) {
      // User clicked prev on first step, go back to title step
      setShowTitleStep(true)
    }
    setWorkoutFlow(flow)
  }

  // Handle step changes - trigger AI generation when reaching AI results step
  const handleStepChange = (step: number) => {
    if (
      workoutFlow === 'ai' &&
      step === 3 &&
      !aiWorkoutResult &&
      !isGeneratingAiWorkout
    ) {
      handleGenerateAiWorkout()
    }
  }

  // Handle creating favourite from manual data
  const handleFinishManual = async () => {
    if (selectedExerciseObjects.length === 0) {
      console.error('Missing exercises')
      return
    }

    try {
      const workoutTitle = title.trim() || 'My Workout'

      await createFromManual({ title: workoutTitle }, selectedExerciseObjects)

      handleSuccess()
    } catch (error) {
      console.error('Failed to create favourite workout:', error)
    }
  }

  // Handle creating favourite from AI data
  const handleFinishAI = async () => {
    if (!aiWorkoutResult) {
      console.error('Missing AI workout result')
      return
    }

    try {
      const workoutTitle = title.trim() || 'Untitled Workout'

      await createFromAI({ title: workoutTitle }, aiWorkoutResult)

      handleSuccess()
    } catch (error) {
      console.error('Failed to create favourite workout:', error)
    }
  }

  // Unified finish handler
  const handleFinish = () => {
    if (workoutFlow === 'ai') {
      return handleFinishAI()
    } else if (workoutFlow === 'manual') {
      return handleFinishManual()
    }
  }

  // Step validation for the wizard
  const canProceedFromStep = (step: number) => {
    if (workoutFlow === 'manual') {
      switch (step) {
        case 2: // exercises step
          return canProceedToReview
        default:
          return true
      }
    }

    if (workoutFlow === 'ai') {
      switch (step) {
        case 3: // ai-results step
          return (
            !!aiWorkoutResult && !isGeneratingAiWorkout && !aiGenerationError
          )
        default:
          return true
      }
    }

    return true
  }

  const handleSuccess = () => {
    onSuccess()
    handleClose()
  }

  const handleClose = () => {
    // Reset all state
    setTitle('')
    setWorkoutFlow(null)
    setShowTitleStep(true)

    // Reset wizard data would be nice but hooks don't expose reset functions
    // This will be handled when the modal reopens

    onClose()
  }

  // Title and description step
  if (showTitleStep) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent fullScreen dialogTitle="Create Favourite Workout">
          <div className="space-y-6">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-2xl font-bold">Create Favourite Workout</h2>
              <p className="text-muted-foreground">
                Give your workout a name and choose how to build it
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Workout Name"
                id="title"
                placeholder="e.g., Morning Push Routine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus={false}
              />
            </div>

            {/* Workout Creation Options */}
            <WorkoutCreationLanding
              onSelectManual={handleSelectManual}
              onSelectAI={handleSelectAI}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Workout creation wizard
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent fullScreen dialogTitle="Create Favourite Workout">
        <QuickWorkoutWizard
          workoutFlow={workoutFlow}
          onFlowChange={handleFlowChange}
          canProceedFromStep={canProceedFromStep}
          isAdding={isCreating}
          onFinish={handleFinish}
          onStepChange={handleStepChange}
          footerClassName={cn('sticky bottom-[-24px]')}
          finishButtonText="Add to Favourites"
          // Manual flow components (reuse existing)
          muscleGroupsComponent={
            <ManualMuscleGroupsStep
              muscleGroups={allMuscleGroups}
              selectedMuscleGroups={selectedMuscleGroups}
              onMuscleGroupToggle={(alias: string) => {
                const newSelection = selectedMuscleGroups.includes(alias)
                  ? selectedMuscleGroups.filter((g) => g !== alias)
                  : [...selectedMuscleGroups, alias]
                setSelectedMuscleGroups(newSelection)
              }}
            />
          }
          equipmentComponent={
            <ManualEquipmentStep
              selectedEquipment={selectedEquipment}
              onEquipmentToggle={(equipment) => {
                const newSelection = selectedEquipment.includes(equipment)
                  ? selectedEquipment.filter((e) => e !== equipment)
                  : [...selectedEquipment, equipment]
                setSelectedEquipment(newSelection)
              }}
            />
          }
          exercisesComponent={
            <ManualExercisesStep
              filteredExercises={filteredExercises}
              selectedExercises={selectedExercises}
              onExerciseSelect={handleExerciseSelect}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              existingExercises={[]} // No existing exercises for favourites
              selectedMuscleGroups={selectedMuscleGroups}
              onMuscleGroupChange={setSelectedMuscleGroups}
              selectedEquipment={selectedEquipment}
              onEquipmentChange={setSelectedEquipment}
            />
          }
          reviewComponent={
            <ManualReviewStep
              existingExercises={[]} // No existing exercises for favourites
              selectedExercises={selectedExerciseObjects}
              onReorderExercises={handleReorderExercises}
              onRemoveExercise={handleRemoveExercise}
            />
          }
          // AI flow components (reuse existing)
          aiMuscleGroupsComponent={
            <AiMuscleGroupsStep
              data={aiInputData}
              onDataChange={setAiInputData}
              muscleGroups={allMuscleGroups}
            />
          }
          aiEquipmentComponent={
            <AiEquipmentStep data={aiInputData} onDataChange={setAiInputData} />
          }
          aiParametersComponent={
            <AiParametersStep
              data={aiInputData}
              onDataChange={setAiInputData}
            />
          }
          aiResultsComponent={
            <AiResultsStep
              data={aiWorkoutResult}
              inputData={aiInputData}
              isLoading={isGeneratingAiWorkout}
              error={aiGenerationError}
              onRetry={handleRetryAiGeneration}
              onExercisesReorder={handleExercisesReorder}
            />
          }
        />
      </DialogContent>
    </Dialog>
  )
}
