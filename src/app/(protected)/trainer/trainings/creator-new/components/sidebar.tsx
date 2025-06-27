'use client'

import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import {
  GQLTrainerExercisesQuery,
  useMuscleGroupCategoriesQuery,
} from '@/generated/graphql-client'

import { ExerciseCard } from './exercise-card'

interface SidebarProps {
  searchTerm: string
  selectedMuscleGroup: string
  selectedEquipment: string
  exercises: GQLTrainerExercisesQuery['userExercises'] &
    GQLTrainerExercisesQuery['publicExercises']
  isLoading: boolean
  onSearchChange: (value: string) => void
  onMuscleGroupChange: (value: string) => void
  onEquipmentChange: (value: string) => void
}

export function Sidebar({
  searchTerm,
  selectedMuscleGroup,
  selectedEquipment,
  exercises,
  isLoading,
  onSearchChange,
  onMuscleGroupChange,
  onEquipmentChange,
}: SidebarProps) {
  const {
    data: muscleGroupCategoriesData,
    isLoading: muscleGroupCategoriesLoading,
  } = useMuscleGroupCategoriesQuery()
  const allMuscleGroups = muscleGroupCategoriesData?.muscleGroupCategories || []

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesMuscleGroup =
      selectedMuscleGroup === 'all' ||
      exercise.muscleGroups.some(
        (muscleGroup) => muscleGroup.groupSlug === selectedMuscleGroup,
      )
    const matchesEquipment =
      selectedEquipment === 'all' || exercise.equipment === selectedEquipment
    return matchesSearch && matchesMuscleGroup && matchesEquipment
  })

  return (
    <div className="w-80 bg-card dark:bg-card-on-card shadow-xs rounded-lg p-4 h-full max-h-full min-w-[300px]">
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Filters:</h3>
        <div className="space-y-3">
          <div>
            <Label className="mb-1">Muscle groups</Label>
            <Select
              value={selectedMuscleGroup}
              onValueChange={onMuscleGroupChange}
              disabled={muscleGroupCategoriesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {allMuscleGroups?.map((muscleGroup) => (
                  <SelectItem key={muscleGroup.id} value={muscleGroup.slug}>
                    {muscleGroup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1">Equipment</Label>
            <Select value={selectedEquipment} onValueChange={onEquipmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <SelectItem key={equipment.value} value={equipment.value}>
                    {equipment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Input
              id="search-input"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              iconStart={<SearchIcon />}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Exercises:</h3>
        <div className="space-y-2">
          {isLoading && <p>Loading...</p>}
          {!isLoading && filteredExercises.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises found</p>
          )}
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </div>
    </div>
  )
}
