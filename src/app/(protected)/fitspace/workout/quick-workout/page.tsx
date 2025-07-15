'use client'

import { useMemo, useState } from 'react'

import {
  GQLTrainingPlan,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'

import { AiEquipmentStep } from './components/ai-equipment-step'
import { AiMuscleGroupsStep } from './components/ai-muscle-groups-step'
import { AiParametersStep } from './components/ai-parameters-step'
import { AiResultsStep } from './components/ai-results-step'
import { ExistingWorkoutView } from './components/existing-workout-view'
import {
  QuickWorkoutWizard,
  WorkoutFlow,
} from './components/quick-workout-wizard'
import { WorkoutCreationLanding } from './components/workout-creation-landing'
import { useAiWorkoutGeneration } from './hooks/use-ai-workout-generation'
import { hasTodaysWorkoutExercises } from './utils/workout-utils'

export default function QuickWorkoutPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlow>(null)

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

  // Data fetching
  const { data: exercisesData } = useFitspaceGetExercisesQuery()
  const { data: quickWorkoutPlanData } =
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

  // Muscle groups data
  const allMuscleGroups = useMemo(() => {
    return (
      exercisesData?.muscleGroupCategories?.flatMap(
        (category) => category.muscles,
      ) || []
    )
  }, [exercisesData])

  const shouldShowWizard = showWizard || !hasExistingWorkout

  // Step change handler for AI flow
  const handleStepChange = (step: number) => {
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

  // Handle workflow selection
  const handleSelectManual = () => {
    setWorkoutFlow('manual')
  }

  const handleSelectAI = () => {
    setWorkoutFlow('ai')
  }

  // Handle creating new workout
  const handleCreateNewWorkout = () => {
    setShowWizard(true)
  }

  // Handle continuing existing workout
  const handleContinueWorkout = () => {
    // Navigate to workout session or similar
    console.log('Continue workout')
  }

  // Placeholder components for manual flow (to be implemented)
  const placeholderComponent = (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
      <p className="text-muted-foreground">Manual flow - to be implemented</p>
    </div>
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
    <AiParametersStep
      data={aiInputData}
      onDataChange={setAiInputData}
      selectedMuscleGroups={aiInputData.selectedMuscleGroups}
      selectedEquipment={aiInputData.selectedEquipment}
    />
  )

  const aiResultsComponent = (
    <AiResultsStep
      data={aiWorkoutResult}
      isLoading={isGeneratingAiWorkout}
      error={aiGenerationError}
      onRetry={handleRetryAiGeneration}
    />
  )

  return (
    <div className="min-h-screen pb-[80px]">
      {shouldShowWizard ? (
        <QuickWorkoutWizard
          showLanding={!hasExistingWorkout}
          workoutFlow={workoutFlow}
          onFlowChange={setWorkoutFlow}
          hasExistingWorkout={hasExistingWorkout}
          canProceedFromStep={() => true} // Simplified for now
          isAdding={false} // Simplified for now
          onFinish={() => console.log('Finish workout')} // Placeholder
          onStepChange={handleStepChange}
          // Manual flow components (placeholders)
          landingComponent={
            <WorkoutCreationLanding
              onSelectManual={handleSelectManual}
              onSelectAI={handleSelectAI}
            />
          }
          muscleGroupsComponent={placeholderComponent}
          equipmentComponent={placeholderComponent}
          exercisesComponent={placeholderComponent}
          reviewComponent={placeholderComponent}
          // AI flow components
          aiMuscleGroupsComponent={aiMuscleGroupsComponent}
          aiEquipmentComponent={aiEquipmentComponent}
          aiParametersComponent={aiParametersComponent}
          aiResultsComponent={aiResultsComponent}
        />
      ) : (
        <ExistingWorkoutView
          quickWorkoutPlan={quickWorkoutPlan}
          onContinueWorkout={handleContinueWorkout}
          onCreateNewWorkout={handleCreateNewWorkout}
        />
      )}
    </div>
  )
}
