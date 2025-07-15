import {
  GQLEquipment,
  GQLFitspaceGetUserQuickWorkoutPlanQuery,
  GQLTrainingDay,
} from '@/generated/graphql-client'

import { Exercise } from './components/exercise-card'

/**
 * Configuration for step-by-step wizard navigation
 */
export interface WizardStep {
  id: string
  title: string
  description: string
}

/**
 * Props for the quick workout filtering functionality
 */
export interface QuickWorkoutFilterState {
  searchTerm: string
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  filteredExercises: Exercise[]
  hasActiveFilters: boolean
}

/**
 * Props for exercise selection functionality
 */
export interface ExerciseSelectionState {
  selectedExercises: Exercise[]
  selectedExerciseIds: string[]
  selectionCount: number
  hasSelection: boolean
  validationResult: {
    isValid: boolean
    message?: string
  }
}

/**
 * Props for workout action functionality
 */
export interface QuickWorkoutActionState {
  isAddingExercises: boolean
  isRemovingExercise: boolean
  isLoading: boolean
}

/**
 * Common props for quick workout components
 */
export interface BaseQuickWorkoutProps {
  quickWorkoutPlan?: GQLFitspaceGetUserQuickWorkoutPlanQuery['getQuickWorkoutPlan']
  todaysWorkout?: {
    day: GQLTrainingDay
    exercises: Exercise[]
  } | null
  hasExistingWorkout: boolean
}

/**
 * Exercise preparation for API submission
 */
export interface ExerciseSubmission {
  exerciseId: string
  order: number
}

/**
 * Muscle group data structure
 */
export interface MuscleGroupData {
  id: string
  alias?: string | null
  groupSlug?: string | null
}
