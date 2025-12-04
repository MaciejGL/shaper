import { useQueryState } from 'nuqs'

import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

export const useSearchQueries = () => {
  const [searchTerm, setSearchTerm] = useQueryState('search', {
    defaultValue: '',
    clearOnDefault: true,
  })
  const [selectedEquipment, setSelectedEquipment] = useQueryState('equipment', {
    defaultValue: 'all',
    clearOnDefault: true,
  })
  const [selectedCategory, setSelectedCategory] = useQueryState('category', {
    defaultValue: 'all',
    clearOnDefault: true,
  })
  const [showOnlyMine, setShowOnlyMine] = useQueryState('showOnlyMine', {
    defaultValue: 'false',
    clearOnDefault: true,
  })

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedEquipment('all')
    setSelectedCategory('all')
    setShowOnlyMine('false')
  }

  const hasAnyFilter =
    searchTerm !== '' ||
    selectedEquipment !== 'all' ||
    selectedCategory !== 'all' ||
    showOnlyMine === 'true'

  return {
    searchTerm,
    setSearchTerm,
    selectedEquipment,
    setSelectedEquipment,
    selectedCategory,
    setSelectedCategory,
    showOnlyMine,
    setShowOnlyMine,
    resetFilters,
    hasAnyFilter,
  }
}

export const useFilteredExercises = ({
  exercises,
}: {
  exercises?: GQLTrainerExercisesQuery['userExercises'] &
    GQLTrainerExercisesQuery['publicExercises']
}) => {
  const { searchTerm, selectedEquipment, selectedCategory } = useSearchQueries()

  const filteredExercises = exercises?.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEquipment =
      selectedEquipment === 'all' || exercise.equipment === selectedEquipment
    const matchesCategory =
      selectedCategory === 'all' ||
      exercise.muscleGroups.some(
        (mg) => mg.displayGroup.toLowerCase() === selectedCategory,
      )

    return matchesSearch && matchesEquipment && matchesCategory
  })
  return {
    filteredExercises,
  }
}
