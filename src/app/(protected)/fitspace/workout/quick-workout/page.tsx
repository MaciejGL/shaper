'use client'

import { useMemo, useState } from 'react'

import {
  GQLTrainingPlan,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'
import { useExerciseSelection } from '@/hooks/use-exercise-selection'
import { useQuickWorkoutActions } from '@/hooks/use-quick-workout-actions'
import { useQuickWorkoutFilters } from '@/hooks/use-quick-workout-filters'

import { AiEquipmentStep } from './components/ai-equipment-step'
import { AiMuscleGroupsStep } from './components/ai-muscle-groups-step'
import { AiParametersStep } from './components/ai-parameters-step'
import type { AiWorkoutInputData } from './components/ai-workout-input'
import { ExerciseSelectionReview } from './components/exercise-selection-review'
import { ExistingWorkoutView } from './components/existing-workout-view'
import { QuickWorkoutFilters } from './components/quick-workout-filters'
import {
  QuickWorkoutWizard,
  QuickWorkoutWizardSkeleton,
  type WorkoutFlow,
} from './components/quick-workout-wizard'
import { WorkoutCreationLanding } from './components/workout-creation-landing'
import {
  getTodaysWorkoutExercises,
  hasTodaysWorkoutExercises,
} from './utils/workout-utils'

export default function QuickWorkoutPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlow>(null)

  // AI workout input state
  const [aiInputData, setAiInputData] = useState<AiWorkoutInputData>({
    selectedMuscleGroups: [],
    selectedEquipment: [],
    exerciseCount: 5,
    maxSetsPerExercise: 3,
  })

  // Data fetching
  const { data: exercisesData } = useFitspaceGetExercisesQuery()
  const { data: quickWorkoutPlanData, isLoading: isLoadingQuickWorkoutPlan } =
    useFitspaceGetUserQuickWorkoutPlanQuery(
      {},
      {
        refetchOnMount: true,
      },
    )

  // Process data
  const allExercises = useMemo(
    () => [...(exercisesData?.getExercises?.publicExercises || [])],
    [exercisesData],
  )

  const quickWorkoutPlan = useMemo(() => {
    return quickWorkoutPlanData?.getQuickWorkoutPlan
  }, [quickWorkoutPlanData])

  const todaysWorkout = quickWorkoutPlan
    ? getTodaysWorkoutExercises(quickWorkoutPlan)
    : null

  const hasExistingWorkout = useMemo(() => {
    return hasTodaysWorkoutExercises(quickWorkoutPlan as GQLTrainingPlan)
  }, [quickWorkoutPlan])

  const shouldShowWizard = showWizard || !hasExistingWorkout

  // Muscle groups data
  const ALL_MUSCLE_GROUPS =
    exercisesData?.muscleGroupCategories?.flatMap(
      (category) => category.muscles,
    ) || []

  // Custom hooks for state management
  const filters = useQuickWorkoutFilters({ allExercises })
  const exerciseSelection = useExerciseSelection({ allExercises })
  const actions = useQuickWorkoutActions()

  // Main action handlers
  const handleAddExercises = async () => {
    const existingExercisesCount = todaysWorkout?.exercises.length || 0
    const exercisesToAdd = exerciseSelection.prepareForSubmission(
      existingExercisesCount,
    )

    await actions.handleAddExercises(exercisesToAdd, quickWorkoutPlan?.id)
  }

  const handleContinueWorkout = () => {
    actions.navigateToWorkout(quickWorkoutPlan?.id || '')
  }

  const handleCreateNewWorkout = () => {
    setShowWizard(true)
    setWorkoutFlow(null) // Reset flow to show landing
  }

  const handleWizardStepChange = (step: number) => {
    if (step === -1) {
      setShowWizard(false)
      setWorkoutFlow(null) // Reset flow when going back
    }
  }

  const handleFlowChange = (flow: WorkoutFlow) => {
    setWorkoutFlow(flow)
    // Reset AI input data when switching flows
    if (flow === 'ai') {
      setAiInputData({
        selectedMuscleGroups: [],
        selectedEquipment: [],
        exerciseCount: 5,
        maxSetsPerExercise: 3,
      })
    }
  }

  // Validation for proceeding from each step
  const canProceedFromStep = () => {
    // All steps in both manual and AI flows are valid for now
    // AI steps are optional and manual steps use existing validation
    return true
  }

  // Landing component
  const landingComponent = (
    <WorkoutCreationLanding
      onSelectManual={() => handleFlowChange('manual')}
      onSelectAI={() => handleFlowChange('ai')}
    />
  )

  // AI step components
  const aiMuscleGroupsComponent = (
    <AiMuscleGroupsStep
      muscleGroups={ALL_MUSCLE_GROUPS}
      data={aiInputData}
      onDataChange={setAiInputData}
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

  // Render different components based on current step
  const renderStepComponent = (stepId: string) => {
    switch (stepId) {
      case 'muscle-groups':
      case 'equipment':
      case 'exercises':
        return (
          <QuickWorkoutFilters
            selectedMuscleGroups={filters.selectedMuscleGroups}
            onMuscleGroupToggle={filters.handleMuscleGroupToggle}
            muscleGroups={ALL_MUSCLE_GROUPS}
            selectedEquipment={filters.selectedEquipment}
            onEquipmentToggle={filters.handleEquipmentToggle}
            filteredExercises={filters.filteredExercises}
            selectedExercises={exerciseSelection.selectedExerciseIds}
            onExerciseSelect={exerciseSelection.handleExerciseSelect}
            searchTerm={filters.searchTerm}
            onSearchChange={filters.handleSearchChange}
            currentStep={stepId as 'muscle-groups' | 'equipment' | 'exercises'}
          />
        )

      case 'review':
        return (
          <ExerciseSelectionReview
            existingExercises={todaysWorkout?.exercises || []}
            selectedExercises={exerciseSelection.selectedExercises}
            onReorderExercises={exerciseSelection.reorderExercises}
            onRemoveExercise={(exerciseId) => {
              // Handle removal of both new and existing exercises
              if (exerciseSelection.isExerciseSelected(exerciseId)) {
                exerciseSelection.handleExerciseSelect(exerciseId)
              } else {
                actions.handleRemoveExercise(exerciseId)
              }
            }}
            isRemovingExercise={actions.isRemovingExercise}
            validationMessage={exerciseSelection.validationResult.message}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="pb-[64px] space-y-6">
      {isLoadingQuickWorkoutPlan ? (
        <QuickWorkoutWizardSkeleton />
      ) : shouldShowWizard ? (
        <QuickWorkoutWizard
          // Flow control
          showLanding={!hasExistingWorkout}
          workoutFlow={workoutFlow}
          onFlowChange={handleFlowChange}
          // Landing component
          landingComponent={landingComponent}
          // Manual flow components
          muscleGroupsComponent={renderStepComponent('muscle-groups')}
          equipmentComponent={renderStepComponent('equipment')}
          exercisesComponent={renderStepComponent('exercises')}
          reviewComponent={renderStepComponent('review')}
          // AI flow components
          aiMuscleGroupsComponent={aiMuscleGroupsComponent}
          aiEquipmentComponent={aiEquipmentComponent}
          aiParametersComponent={aiParametersComponent}
          aiResultsComponent={<div>AI Results Component - Coming Soon</div>}
          // Validation and actions
          canProceedFromStep={canProceedFromStep}
          isAdding={actions.isAddingExercises}
          onFinish={handleAddExercises}
          hasExistingWorkout={hasExistingWorkout}
          onStepChange={handleWizardStepChange}
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
