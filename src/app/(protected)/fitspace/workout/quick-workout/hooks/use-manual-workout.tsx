import { useMemo, useState } from 'react'

import { GQLEquipment } from '@/generated/graphql-client'

import type { Exercise } from '../components/exercise-card'
import {
  filterExercises,
  toggleEquipment,
  toggleMuscleGroup,
} from '../utils/exercise-filters'

interface UseManualWorkoutOptions {
  allExercises?: Exercise[]
}

export function useManualWorkout({
  allExercises = [],
}: UseManualWorkoutOptions) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])

  // Selection state
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])

  // Derived state - filtered exercises
  const filteredExercises = useMemo(() => {
    return filterExercises({
      exercises: allExercises,
      searchTerm,
      selectedMuscleGroups,
      selectedEquipment,
    })
  }, [allExercises, searchTerm, selectedMuscleGroups, selectedEquipment])

  // Get selected exercise objects
  const selectedExerciseObjects = useMemo(() => {
    return filteredExercises.filter((exercise) =>
      selectedExercises.includes(exercise.id),
    )
  }, [filteredExercises, selectedExercises])

  // Toggle functions
  const handleMuscleGroupToggle = (alias: string) => {
    setSelectedMuscleGroups((prev) => toggleMuscleGroup(prev, alias))
  }

  const handleEquipmentToggle = (equipment: GQLEquipment) => {
    setSelectedEquipment((prev) => toggleEquipment(prev, equipment))
  }

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    )
  }

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId))
  }

  const handleReorderExercises = (reorderedExercises: Exercise[]) => {
    setSelectedExercises(reorderedExercises.map((ex) => ex.id))
  }

  // Clear functions
  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedMuscleGroups([])
    setSelectedEquipment([])
  }

  const clearSelection = () => {
    setSelectedExercises([])
  }

  const clearAll = () => {
    clearAllFilters()
    clearSelection()
  }

  // Validation
  const canProceedToReview = selectedExercises.length > 0
  const hasActiveFilters =
    selectedMuscleGroups.length > 0 ||
    selectedEquipment.length > 0 ||
    searchTerm.length > 0

  return {
    // Filter state
    searchTerm,
    selectedMuscleGroups,
    selectedEquipment,

    // Selection state
    selectedExercises,
    selectedExerciseObjects,

    // Derived data
    filteredExercises,

    // Actions
    setSearchTerm,
    handleMuscleGroupToggle,
    handleEquipmentToggle,
    handleExerciseSelect,
    handleRemoveExercise,
    handleReorderExercises,

    // Clear actions
    clearAllFilters,
    clearSelection,
    clearAll,

    // Validation
    canProceedToReview,
    hasActiveFilters,
  }
}
