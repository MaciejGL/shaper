import {
  GQLBaseExercise,
  GQLEquipment,
  GQLMuscleGroup,
} from '@/generated/graphql-client'

import { Exercise } from '../components/exercise-card'

/**
 * Type for exercises from GraphQL queries with required fields
 */
type GraphQLExercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'id' | 'alias' | 'groupSlug'>[]
}

/**
 * Filters exercises based on search term, muscle groups, and equipment
 */
export function filterExercises({
  exercises,
  searchTerm,
  selectedMuscleGroups,
  selectedEquipment,
}: {
  exercises: GraphQLExercise[]
  searchTerm: string
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
}): Exercise[] {
  return exercises
    .filter((ex) => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTermLower) ||
        ex.muscleGroups.some((group) =>
          group.alias?.toLowerCase().includes(searchTermLower),
        ) ||
        ex.equipment?.toLowerCase().includes(searchTermLower)

      const matchesMuscleGroup =
        selectedMuscleGroups.length === 0 ||
        ex.muscleGroups.some(
          (group) => group.alias && selectedMuscleGroups.includes(group.alias),
        )

      const matchesEquipment =
        selectedEquipment.length === 0 ||
        (ex.equipment && selectedEquipment.includes(ex.equipment))

      return matchesSearch && matchesMuscleGroup && matchesEquipment
    })
    .map((ex) => ({
      id: ex.id,
      name: ex.name,
      equipment: ex.equipment,
      muscleGroups: ex.muscleGroups.map((mg) => ({
        id: mg.id,
        alias: mg.alias,
        groupSlug: mg.groupSlug,
      })),
    }))
}

/**
 * Toggles a muscle group in the selected muscle groups array
 */
export function toggleMuscleGroup(
  selectedMuscleGroups: string[],
  alias: string,
): string[] {
  return selectedMuscleGroups.includes(alias)
    ? selectedMuscleGroups.filter((g) => g !== alias)
    : [...selectedMuscleGroups, alias]
}

/**
 * Toggles equipment in the selected equipment array
 */
export function toggleEquipment(
  selectedEquipment: GQLEquipment[],
  equipment: GQLEquipment,
): GQLEquipment[] {
  return selectedEquipment.includes(equipment)
    ? selectedEquipment.filter((e) => e !== equipment)
    : [...selectedEquipment, equipment]
}
