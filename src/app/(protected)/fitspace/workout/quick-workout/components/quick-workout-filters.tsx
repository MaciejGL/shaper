'use client'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment, GQLMuscleGroup } from '@/generated/graphql-client'

import { EquipmentFilters } from '../../[trainingId]/components/equipment-filters'
import { ExercisesList } from '../../[trainingId]/components/exercises-list'

import { Exercise } from './exercise-card'

interface QuickWorkoutFiltersProps {
  // Muscle groups
  selectedMuscleGroups: string[]
  onMuscleGroupToggle: (alias: string) => void
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]

  // Equipment
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void

  // Exercises and search
  filteredExercises: Exercise[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void

  // Step control - determines which component to show
  currentStep: 'muscle-groups' | 'equipment' | 'exercises'
}

/**
 * Combined filtering component for the quick workout wizard
 * Renders different filtering UIs based on the current step
 */
export function QuickWorkoutFilters({
  selectedMuscleGroups,
  onMuscleGroupToggle,
  muscleGroups,
  selectedEquipment,
  onEquipmentToggle,
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
  searchTerm,
  onSearchChange,
  currentStep,
}: QuickWorkoutFiltersProps) {
  const allEquipment = EQUIPMENT_OPTIONS.map((equipment) => equipment.value)

  switch (currentStep) {
    case 'muscle-groups':
      return (
        <EnhancedBodyView
          selectedMuscleGroups={selectedMuscleGroups}
          onMuscleGroupClick={onMuscleGroupToggle}
          muscleGroups={muscleGroups}
        />
      )

    case 'equipment':
      return (
        <EquipmentFilters
          selectedEquipment={selectedEquipment}
          onEquipmentToggle={onEquipmentToggle}
          equipment={allEquipment}
          variant="cards"
        />
      )

    case 'exercises':
      return (
        <ExercisesList
          selectedExercises={selectedExercises}
          onExerciseSelect={onExerciseSelect}
          filteredExercises={filteredExercises}
          onSearch={onSearchChange}
          searchTerm={searchTerm}
        />
      )

    default:
      return null
  }
}
