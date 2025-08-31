'use client'

import { PlusIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
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

import { CreateExerciseDialog } from '../../../exercises/components/create-exercise-dialog'

import { ExerciseCard } from './exercise-card'

interface SidebarProps {
  searchTerm: string
  selectedMuscleGroup: string
  selectedEquipment: string
  trainerExercises: GQLTrainerExercisesQuery['userExercises']
  publicExercises: GQLTrainerExercisesQuery['publicExercises']
  isLoading: boolean
  onSearchChange: (value: string) => void
  onMuscleGroupChange: (value: string) => void
  onEquipmentChange: (value: string) => void
}

export function Sidebar({
  searchTerm,
  selectedMuscleGroup,
  selectedEquipment,
  trainerExercises,
  publicExercises,
  isLoading,
  onSearchChange,
  onMuscleGroupChange,
  onEquipmentChange,
}: SidebarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const {
    data: muscleGroupCategoriesData,
    isLoading: muscleGroupCategoriesLoading,
  } = useMuscleGroupCategoriesQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )
  const allMuscleGroups = muscleGroupCategoriesData?.muscleGroupCategories || []

  // Deduplicate exercises by ID and apply filters with memoization for performance
  const filteredExercises = useMemo(() => {
    // Deduplicate exercises by ID, prioritizing trainer exercises over public ones
    const exerciseMap: Map<
      string,
      GQLTrainerExercisesQuery['userExercises'][number]
    > = new Map()

    // Add public exercises first
    publicExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    // Add trainer exercises (will override public ones with same ID)
    trainerExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    // Convert back to array and apply filters
    const allExercises = Array.from(exerciseMap.values())
    return allExercises.filter((exercise) => {
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
  }, [
    trainerExercises,
    publicExercises,
    searchTerm,
    selectedMuscleGroup,
    selectedEquipment,
  ])

  return (
    <div className="w-80 bg-card dark:bg-card-on-card shadow-xs rounded-lg p-4 h-full max-h-full min-w-[260px]">
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
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold mb-3">Exercises:</h3>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="secondary"
            iconOnly={<PlusIcon />}
          >
            Create exercise
          </Button>
        </div>
        {isCreateDialogOpen && (
          <CreateExerciseDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            categories={allMuscleGroups}
            publicExercises={publicExercises}
            userExercises={trainerExercises}
          />
        )}
        <div className="space-y-2">
          {isLoading && <p>Loading...</p>}
          {!isLoading && filteredExercises.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises found</p>
          )}
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              categories={allMuscleGroups}
              publicExercises={publicExercises}
              userExercises={trainerExercises}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
