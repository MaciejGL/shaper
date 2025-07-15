import { useMemo, useState } from 'react'

import {
  filterExercises,
  toggleEquipment,
  toggleMuscleGroup,
} from '@/app/(protected)/fitspace/workout/quick-workout/utils/exercise-filters'
import {
  GQLBaseExercise,
  GQLEquipment,
  GQLMuscleGroup,
} from '@/generated/graphql-client'

/**
 * Type for exercises from GraphQL queries with required fields
 */
type GraphQLExercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
}

interface UseQuickWorkoutFiltersProps {
  allExercises: GraphQLExercise[]
}

/**
 * Custom hook for managing quick workout filtering state and logic
 * Handles search, muscle group selection, and equipment filtering
 */
export function useQuickWorkoutFilters({
  allExercises,
}: UseQuickWorkoutFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])

  // Memoized filtered exercises to prevent unnecessary recalculations
  const filteredExercises = useMemo(() => {
    return filterExercises({
      exercises: allExercises,
      searchTerm,
      selectedMuscleGroups,
      selectedEquipment,
    })
  }, [allExercises, searchTerm, selectedMuscleGroups, selectedEquipment])

  // Handler functions for filter updates
  const handleMuscleGroupToggle = (alias: string) => {
    setSelectedMuscleGroups((prev) => toggleMuscleGroup(prev, alias))
  }

  const handleEquipmentToggle = (equipment: GQLEquipment) => {
    setSelectedEquipment((prev) => toggleEquipment(prev, equipment))
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedMuscleGroups([])
    setSelectedEquipment([])
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    selectedMuscleGroups.length > 0 ||
    selectedEquipment.length > 0

  return {
    // State
    searchTerm,
    selectedMuscleGroups,
    selectedEquipment,
    filteredExercises,

    // Computed values
    hasActiveFilters,

    // Actions
    handleMuscleGroupToggle,
    handleEquipmentToggle,
    handleSearchChange,
    resetFilters,
  }
}
