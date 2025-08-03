import { useEffect, useMemo, useState } from 'react'

import { GQLEquipment } from '@/generated/graphql-client'

import type { Exercise } from '../components/exercise-card'
import { filterExercises } from '../utils/exercise-filters'

interface UseManualWorkoutOptions {
  allExercises?: Exercise[]
  initialSelectedExercises?: string[]
}

export function useManualWorkout({
  allExercises = [],
  initialSelectedExercises = [],
}: UseManualWorkoutOptions) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])

  // Selection state
  const [selectedExercises, setSelectedExercises] = useState<string[]>(
    initialSelectedExercises,
  )

  // Sync selected exercises when initial data changes
  useEffect(() => {
    if (initialSelectedExercises.length > 0) {
      setSelectedExercises(initialSelectedExercises)
    }
  }, [initialSelectedExercises])

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
    // Create a map for efficient lookup
    const exerciseMap = new Map(allExercises.map((ex) => [ex.id, ex]))

    // Return exercises in the order they were selected (preserves drag-and-drop order)
    return selectedExercises
      .map((id) => exerciseMap.get(id))
      .filter((exercise): exercise is Exercise => exercise !== undefined)
  }, [allExercises, selectedExercises])

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

    // Filter setters
    setSearchTerm,
    setSelectedMuscleGroups,
    setSelectedEquipment,

    // Selection state
    selectedExercises,
    selectedExerciseObjects,
    filteredExercises,

    // Actions
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
