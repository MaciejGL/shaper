'use client'

import { useMemo, useState } from 'react'

import { CardSkeleton } from '@/components/card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GQLTrainingPlan,
  useFitspaceCreateQuickWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'

import { AiEquipmentStep } from './components/ai-equipment-step'
import { AiMuscleGroupsStep } from './components/ai-muscle-groups-step'
import { AiParametersStep } from './components/ai-parameters-step'
import { AiResultsStep } from './components/ai-results-step'
import type { Exercise } from './components/exercise-card'
import { ExistingWorkoutView } from './components/existing-workout-view'
import { ManualEquipmentStep } from './components/manual-equipment-step'
import { ManualExercisesStep } from './components/manual-exercises-step'
import { ManualMuscleGroupsStep } from './components/manual-muscle-groups-step'
import { ManualReviewStep } from './components/manual-review-step'
import {
  QuickWorkoutWizard,
  WorkoutFlow,
} from './components/quick-workout-wizard'
import { WorkoutCreationLanding } from './components/workout-creation-landing'
import { useAiWorkoutGeneration } from './hooks/use-ai-workout-generation'
import { useManualWorkout } from './hooks/use-manual-workout'
import { scrollToTop } from './utils/scroll-utils'
import {
  getTodaysWorkoutExercises,
  hasTodaysWorkoutExercises,
} from './utils/workout-utils'

export default function QuickWorkoutPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlow>(null)
  const [isAddingToExisting, setIsAddingToExisting] = useState(false)

  // AI workout generation hook
  const {
    aiInputData,
    aiWorkoutResult,
    aiGenerationError,
    isGeneratingAiWorkout,
    setAiInputData,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
  } = useAiWorkoutGeneration()

  // Create workout mutation
  const { mutateAsync: createQuickWorkout, isPending: isCreatingWorkout } =
    useFitspaceCreateQuickWorkoutMutation()

  // Data fetching
  const { data: exercisesData, isLoading: isLoadingExercises } =
    useFitspaceGetExercisesQuery()
  const { data: quickWorkoutPlanData, isLoading: isLoadingPlan } =
    useFitspaceGetUserQuickWorkoutPlanQuery(
      {},
      {
        refetchOnMount: true,
      },
    )

  // Process data
  const quickWorkoutPlan = useMemo(() => {
    return quickWorkoutPlanData?.getQuickWorkoutPlan
  }, [quickWorkoutPlanData])

  const hasExistingWorkout = useMemo(() => {
    return hasTodaysWorkoutExercises(quickWorkoutPlan as GQLTrainingPlan)
  }, [quickWorkoutPlan])

  // Get existing exercises for "Add More" mode
  const existingExercises = useMemo(() => {
    if (!isAddingToExisting || !quickWorkoutPlan) return []

    const todaysWorkout = getTodaysWorkoutExercises(quickWorkoutPlan)
    if (!todaysWorkout?.exercises) return []

    return todaysWorkout.exercises.map(
      (ex): Exercise => ({
        id: ex.id,
        name: ex.name,
        equipment: ex.equipment,
        completedAt: ex.completedAt,
        muscleGroups: ex.muscleGroups.map((mg) => ({
          id: mg.id,
          alias: mg.alias,
          groupSlug: mg.groupSlug,
        })),
      }),
    )
  }, [isAddingToExisting, quickWorkoutPlan])

  // Muscle groups data
  const allMuscleGroups = useMemo(() => {
    return (
      exercisesData?.muscleGroupCategories?.flatMap(
        (category) => category.muscles,
      ) || []
    )
  }, [exercisesData])

  // All exercises data for manual flow
  const allExercises = useMemo(() => {
    const exercises = [
      ...(exercisesData?.getExercises?.trainerExercises || []),
      ...(exercisesData?.getExercises?.publicExercises || []),
    ]
    return exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      equipment: ex.equipment,
      muscleGroups: ex.muscleGroups.map((mg) => ({
        id: mg.id,
        alias: mg.alias,
        groupSlug: mg.groupSlug,
      })),
    }))
  }, [exercisesData])

  // Manual workout state management
  const {
    searchTerm,
    selectedMuscleGroups,
    selectedEquipment,
    selectedExercises,
    selectedExerciseObjects,
    filteredExercises,
    setSearchTerm,
    handleMuscleGroupToggle,
    handleEquipmentToggle,
    handleExerciseSelect,
    handleRemoveExercise,
    handleReorderExercises,
    canProceedToReview,
  } = useManualWorkout({ allExercises })

  // Loading state
  const isLoading = isLoadingExercises || isLoadingPlan

  const shouldShowWizard = showWizard || !hasExistingWorkout

  // Step change handler for AI flow and navigation
  const handleStepChange = (step: number) => {
    // Handle back navigation from wizard
    if (step === -1) {
      if (hasExistingWorkout) {
        // Go back to existing workout view
        setShowWizard(false)
        setWorkoutFlow(null)
        setIsAddingToExisting(false) // Reset adding to existing flag
        scrollToTop()
      } else {
        // If no existing workout, this shouldn't happen, but stay in wizard
        console.warn('Attempted to navigate back with no existing workout')
      }
      return
    }

    // If we're in AI flow and moving from ai-parameters (step 2) to ai-results (step 3)
    if (
      workoutFlow === 'ai' &&
      step === 3 &&
      !aiWorkoutResult &&
      !isGeneratingAiWorkout
    ) {
      handleGenerateAiWorkout()
    }
  }

  // Handle creating workout from AI data
  const handleFinishAI = async () => {
    if (!aiWorkoutResult) {
      console.error('No AI workout result to create')
      return
    }

    try {
      // Transform AI workout data to the format expected by createQuickWorkout
      const exercises = aiWorkoutResult.exercises.map((aiExercise, index) => ({
        exerciseId: aiExercise.exercise.id,
        order: index + 1, // Use sequential order
        sets:
          aiExercise.sets?.map((aiSet, setIndex) => ({
            order: setIndex + 1,
            reps: aiSet?.reps || null,
            minReps: null, // AI doesn't provide min/max, just target reps
            maxReps: null,
            rpe: aiSet?.rpe || null,
            weight: null, // User will fill this during workout
          })) || [],
      }))

      // Create the workout (replace existing exercises)
      await createQuickWorkout({
        input: {
          exercises,
          replaceExisting: true,
        },
      })

      // Navigate to the workout
      if (quickWorkoutPlan?.id) {
        window.location.href = `/fitspace/workout/${quickWorkoutPlan.id}`
      }
    } catch (error) {
      console.error('Failed to create workout:', error)
    }
  }

  // Handle creating workout from manual data
  const handleFinishManual = async () => {
    if (selectedExercises.length === 0) {
      console.error('No exercises selected')
      return
    }

    try {
      // Transform manual workout data to the format expected by createQuickWorkout
      const exercises = selectedExercises.map((exerciseId, index) => ({
        exerciseId,
        order: index + 1, // Use selection order
        sets: [
          // Create default sets for manual selection
          {
            order: 1,
            reps: null,
            minReps: null,
            maxReps: null,
            rpe: null,
            weight: null,
          },
          {
            order: 2,
            reps: null,
            minReps: null,
            maxReps: null,
            rpe: null,
            weight: null,
          },
          {
            order: 3,
            reps: null,
            minReps: null,
            maxReps: null,
            rpe: null,
            weight: null,
          },
        ],
      }))

      // Create the workout
      await createQuickWorkout({
        input: {
          exercises,
          replaceExisting: !isAddingToExisting, // Replace only if not adding to existing
        },
      })

      // Navigate to the workout
      if (quickWorkoutPlan?.id) {
        window.location.href = `/fitspace/workout/${quickWorkoutPlan.id}`
      }
    } catch (error) {
      console.error('Failed to create workout:', error)
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

  // Step validation
  const canProceedFromStep = (step: number) => {
    if (workoutFlow === 'manual') {
      switch (step) {
        case 2: // exercises step
          return canProceedToReview
        default:
          return true
      }
    }
    return true // AI flow or default
  }

  // Handle workflow selection
  const handleSelectManual = () => {
    setWorkoutFlow('manual')
  }

  const handleSelectAI = () => {
    setWorkoutFlow('ai')
  }

  // Handle creating new workout (goes to landing to choose AI/manual)
  const handleCreateNewWorkout = () => {
    setShowWizard(true)
    setWorkoutFlow(null) // Reset flow to show landing
    setIsAddingToExisting(false) // Reset adding to existing flag
    scrollToTop()
  }

  // Handle adding more exercises (goes directly to manual flow)
  const handleAddMoreExercises = () => {
    setShowWizard(true)
    setWorkoutFlow('manual') // Set to manual flow directly
    setIsAddingToExisting(true) // Set flag to indicate adding to existing
    scrollToTop()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pb-[80px]">
        <div className="flex flex-col min-h-screen justify-center items-center p-4">
          <div className="max-w-lg w-full space-y-6">
            {/* Loading header */}
            <div className="text-center space-y-4">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
            </div>

            {/* Loading content */}
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>

            {/* Loading buttons */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Manual components
  const manualMuscleGroupsComponent = (
    <ManualMuscleGroupsStep
      muscleGroups={allMuscleGroups}
      selectedMuscleGroups={selectedMuscleGroups}
      onMuscleGroupToggle={handleMuscleGroupToggle}
    />
  )

  const manualEquipmentComponent = (
    <ManualEquipmentStep
      selectedEquipment={selectedEquipment}
      onEquipmentToggle={handleEquipmentToggle}
    />
  )

  const manualExercisesComponent = (
    <ManualExercisesStep
      filteredExercises={filteredExercises}
      selectedExercises={selectedExercises}
      onExerciseSelect={handleExerciseSelect}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      existingExercises={existingExercises} // Pass existing exercises
    />
  )

  const manualReviewComponent = (
    <ManualReviewStep
      existingExercises={existingExercises}
      selectedExercises={selectedExerciseObjects}
      onReorderExercises={handleReorderExercises}
      onRemoveExercise={handleRemoveExercise}
    />
  )

  // AI components
  const aiMuscleGroupsComponent = (
    <AiMuscleGroupsStep
      data={aiInputData}
      onDataChange={setAiInputData}
      muscleGroups={allMuscleGroups}
    />
  )

  const aiEquipmentComponent = (
    <AiEquipmentStep data={aiInputData} onDataChange={setAiInputData} />
  )

  const aiParametersComponent = (
    <AiParametersStep data={aiInputData} onDataChange={setAiInputData} />
  )

  const aiResultsComponent = (
    <AiResultsStep
      data={aiWorkoutResult}
      inputData={aiInputData}
      isLoading={isGeneratingAiWorkout}
      error={aiGenerationError}
      onRetry={handleRetryAiGeneration}
    />
  )

  return (
    <div className="min-h-screen pb-[80px]">
      {shouldShowWizard ? (
        <QuickWorkoutWizard
          showLanding={workoutFlow === null}
          workoutFlow={workoutFlow}
          onFlowChange={setWorkoutFlow}
          hasExistingWorkout={hasExistingWorkout}
          canProceedFromStep={canProceedFromStep}
          isAdding={isCreatingWorkout}
          onFinish={handleFinish}
          onStepChange={handleStepChange}
          // Landing component
          landingComponent={
            <WorkoutCreationLanding
              onSelectManual={handleSelectManual}
              onSelectAI={handleSelectAI}
            />
          }
          // Manual flow components
          muscleGroupsComponent={manualMuscleGroupsComponent}
          equipmentComponent={manualEquipmentComponent}
          exercisesComponent={manualExercisesComponent}
          reviewComponent={manualReviewComponent}
          // AI flow components
          aiMuscleGroupsComponent={aiMuscleGroupsComponent}
          aiEquipmentComponent={aiEquipmentComponent}
          aiParametersComponent={aiParametersComponent}
          aiResultsComponent={aiResultsComponent}
        />
      ) : (
        <ExistingWorkoutView
          quickWorkoutPlan={quickWorkoutPlan}
          onCreateNewWorkout={handleCreateNewWorkout}
          onAddMoreExercises={handleAddMoreExercises}
        />
      )}
    </div>
  )
}
