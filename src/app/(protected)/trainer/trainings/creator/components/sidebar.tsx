'use client'

import { MoreHorizontalIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import {
  GQLEquipment,
  GQLTrainerExercisesQuery,
  useMuscleGroupCategoriesQuery,
} from '@/generated/graphql-client'

import { CreateExerciseDialog } from '../../../exercises/components/create-exercise-dialog'

import { ExerciseCard } from './exercise-card'

// Configuration for priority filters
const PRIORITY_MUSCLE_GROUPS: readonly string[] = [
  'all',
  'chest',
  'upper-back',
  'lower-back',
  'shoulders',
  'biceps',
  'triceps',
  // 'forearms',
  'quads',
  'hamstrings',
  'glutes',
  // 'calves',
  'core',
  // 'hip-abductors',
  // 'hip-adductors',
  // 'neck',
  // 'stabilizers',
]
const PRIORITY_EQUIPMENT: readonly (GQLEquipment | 'all')[] = [
  'all',
  GQLEquipment.Barbell,
  GQLEquipment.Dumbbell,
  GQLEquipment.EzBar,
  GQLEquipment.SmithMachine,
  GQLEquipment.Cable,
  GQLEquipment.Machine,
  GQLEquipment.Bench,
  // GQLEquipment.Bodyweight,
  // GQLEquipment.Kettlebell,
  // GQLEquipment.Band,
  // GQLEquipment.TrapBar,
  // GQLEquipment.Other,
]

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

  const { data: muscleGroupCategoriesData } = useMuscleGroupCategoriesQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )
  const allMuscleGroups = useMemo(
    () => muscleGroupCategoriesData?.muscleGroupCategories || [],
    [muscleGroupCategoriesData],
  )

  // Separate priority and non-priority filters
  const priorityMuscleGroups = useMemo(() => {
    const groups = [{ id: 'all', slug: 'all', name: 'All' }]
    allMuscleGroups.forEach((group) => {
      if (PRIORITY_MUSCLE_GROUPS.includes(group.slug)) {
        groups.push(group)
      }
    })
    return groups
  }, [allMuscleGroups])

  const nonPriorityMuscleGroups = useMemo(() => {
    return allMuscleGroups.filter(
      (group) => !PRIORITY_MUSCLE_GROUPS.includes(group.slug),
    )
  }, [allMuscleGroups])

  const priorityEquipment = useMemo(() => {
    const equipment = [{ value: 'all', label: 'All' }]
    EQUIPMENT_OPTIONS.forEach((eq) => {
      if (PRIORITY_EQUIPMENT.includes(eq.value)) {
        equipment.push(eq)
      }
    })
    return equipment
  }, [])

  const nonPriorityEquipment = useMemo(() => {
    return EQUIPMENT_OPTIONS.filter(
      (eq) => !PRIORITY_EQUIPMENT.includes(eq.value),
    )
  }, [])

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
          (muscleGroup) => muscleGroup.displayGroup === selectedMuscleGroup,
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
    <div className="relative bg-card dark:bg-sidebar shadow-xs rounded-lg h-full max-h-full min-w-[340px] max-w-[340px] flex flex-col overflow-y-auto compact-scrollbar min-h-0">
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Muscle groups</Label>
            <div className="grid grid-cols-4 gap-1">
              {priorityMuscleGroups.map((muscleGroup) => (
                <Badge
                  key={muscleGroup.id}
                  size="md"
                  variant={
                    selectedMuscleGroup === muscleGroup.slug
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() => onMuscleGroupChange(muscleGroup.slug)}
                  className="cursor-pointer w-full rounded-md"
                >
                  {muscleGroup.name.replace('Hip', '')}
                </Badge>
              ))}
              {nonPriorityMuscleGroups.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      size="md"
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      <MoreHorizontalIcon className="h-3 w-3" />
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {nonPriorityMuscleGroups.map((muscleGroup) => (
                        <Badge
                          key={muscleGroup.id}
                          size="sm"
                          variant={
                            selectedMuscleGroup === muscleGroup.slug
                              ? 'primary'
                              : 'secondary'
                          }
                          onClick={() => onMuscleGroupChange(muscleGroup.slug)}
                          className="cursor-pointer w-full justify-center"
                        >
                          {muscleGroup.name.replace('Hip', '')}
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* <Select
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
            </Select> */}
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Equipment</Label>
            <div className="grid grid-cols-3 gap-1">
              {priorityEquipment.map((equipment) => (
                <Badge
                  key={equipment.value}
                  size="md"
                  variant={
                    selectedEquipment === equipment.value
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() => onEquipmentChange(equipment.value)}
                  className="cursor-pointer w-full rounded-md"
                >
                  {equipment.label}
                </Badge>
              ))}
              {nonPriorityEquipment.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      size="md"
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      <MoreHorizontalIcon className="h-3 w-3" />
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid grid-cols-2 gap-1">
                      {nonPriorityEquipment.map((equipment) => (
                        <Badge
                          key={equipment.value}
                          size="sm"
                          variant={
                            selectedEquipment === equipment.value
                              ? 'primary'
                              : 'secondary'
                          }
                          onClick={() => onEquipmentChange(equipment.value)}
                          className="cursor-pointer w-full justify-center"
                        >
                          {equipment.label}
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {/* <Select value={selectedEquipment} onValueChange={onEquipmentChange}>
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
            </Select> */}
          </div>
        </div>
      </div>

      {/* Move search input here to be sticky within scrollable content */}
      <div className="sticky top-0 z-10 bg-card dark:bg-card/50 backdrop-blur-sm p-4 border-b border-border rounded-t-lg">
        <Input
          id="search-input"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          iconStart={<SearchIcon />}
          className="bg-secondary dark:bg-secondary"
        />
      </div>

      <div className="flex-1">
        <div className="p-4">
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
              <p className="text-sm text-muted-foreground">
                No exercises found
              </p>
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
    </div>
  )
}
