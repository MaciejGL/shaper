import { Check, Plus, PlusIcon, Search, XIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  GQLBaseExercise,
  GQLMuscleGroup,
  useFitspaceGetExercisesQuery,
} from '@/generated/graphql-client'

export function AddExerciseModal() {
  const { data } = useFitspaceGetExercisesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const allExercises = useMemo(
    () => [
      ...(data?.getExercises?.trainerExercises || []),
      ...(data?.getExercises?.publicExercises || []),
    ],
    [data],
  )

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
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

      return matchesSearch && matchesMuscleGroup
    })
  }, [allExercises, searchTerm, selectedMuscleGroups])

  const ALL_MUSCLE_GROUPS =
    data?.muscleGroupCategories?.flatMap((category) => category.muscles) || []

  const handleAddExercise = () => {
    // Add your exercise addition logic here
    console.log('Adding exercise:', selectedExercise)
    setSelectedExercise(null)
    setSearchTerm('')
    setSelectedMuscleGroups([])
    setIsOpen(false)
  }

  const handleMuscleGroupToggle = (alias: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(alias) ? prev.filter((g) => g !== alias) : [...prev, alias],
    )
  }

  // const clearAllFilters = () => {
  //   setSelectedMuscleGroups([])
  //   setSearchTerm('')
  // }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          iconStart={<Plus />}
          className="w-full"
        >
          Add exercise
        </Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Add Exercise" fullScreen>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Search for an exercise. Choose from our library or exercises
            provided by your trainer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-6">
          <div className="flex-1">
            {/* <Tabs className="mt-4" defaultValue="body-map">
              <TabsList className="w-full">
                <TabsTrigger value="body-map">Body map</TabsTrigger>
                <TabsTrigger value="muscle-groups">Muscle groups</TabsTrigger>
              </TabsList>
              <TabsContent value="body-map"> */}
            <div className="py-6">
              <EnhancedBodyView
                selectedMuscleGroups={selectedMuscleGroups}
                onMuscleGroupClick={handleMuscleGroupToggle}
                muscleGroups={ALL_MUSCLE_GROUPS}
                className="sticky top-4"
              />
            </div>
            {/* </TabsContent>
              <TabsContent value="muscle-groups">
                <div className="rounded-lg p-4 shadow-neuromorphic-dark-secondary">
                  <MuscleGroupFilters
                    muscleGroups={ALL_MUSCLE_GROUPS}
                    selectedMuscleGroups={selectedMuscleGroups}
                    onMuscleGroupToggle={handleMuscleGroupToggle}
                    onClearAll={clearAllFilters}
                  />
                </div>
              </TabsContent>
            </Tabs> */}
            <ExerciseSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedExercise={selectedExercise}
              onExerciseSelect={setSelectedExercise}
              filteredExercises={filteredExercises}
              selectedMuscleGroups={selectedMuscleGroups}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddExercise}
            disabled={selectedExercise === null}
            iconStart={<PlusIcon />}
          >
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ExerciseSearchProps = {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedExercise: string | null
  onExerciseSelect: (id: string | null) => void
  filteredExercises: (Pick<
    GQLBaseExercise,
    'id' | 'name' | 'equipment' | 'isPublic'
  > & {
    muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  })[]
  selectedMuscleGroups: string[]
}

export function ExerciseSearch({
  searchTerm,
  onSearchChange,
  selectedExercise,
  onExerciseSelect,
  filteredExercises,
  selectedMuscleGroups,
}: ExerciseSearchProps) {
  return (
    <div className="space-y-4 mt-4">
      {selectedMuscleGroups.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Selected muscle:{' '}
          {selectedMuscleGroups.map((alias) => {
            return (
              <Badge key={alias} variant="outline">
                {alias}
              </Badge>
            )
          })}
        </div>
      )}
      <div className="relative">
        <Input
          id="exercise-search"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="max-h-[300px] overflow-y-auto border rounded-md">
        {filteredExercises.length > 0 ? (
          <div className="p-2">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`p-3 flex justify-between cursor-pointer hover:bg-accent rounded-md transition-colors ${
                  selectedExercise === exercise.id ? 'bg-accent' : ''
                }`}
                onClick={() => {
                  if (selectedExercise === exercise.id) {
                    onExerciseSelect(null)
                  } else {
                    onExerciseSelect(exercise.id)
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium">{exercise.name}</div>
                    <Badge size="sm" variant="outline">
                      {exercise.isPublic ? 'Public' : 'Trainer'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exercise.equipment} •{' '}
                    {exercise.muscleGroups
                      .map((group) => group.alias)
                      .join(', ')}
                  </div>
                </div>
                {selectedExercise === exercise.id && (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No exercises found.
          </div>
        )}
      </div>
    </div>
  )
}

interface MuscleGroupFiltersProps {
  muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  selectedMuscleGroups: string[]
  onMuscleGroupToggle: (alias: string) => void // Changed parameter name for clarity
  onClearAll: () => void
}

export function MuscleGroupFilters({
  muscleGroups,
  selectedMuscleGroups,
  onMuscleGroupToggle,
  onClearAll,
}: MuscleGroupFiltersProps) {
  const groupedMuscles = muscleGroups.reduce(
    (acc, muscle) => {
      if (!acc[muscle.groupSlug]) {
        acc[muscle.groupSlug] = []
      }
      acc[muscle.groupSlug].push(muscle)
      return acc
    },
    {} as Record<string, Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]>,
  )

  const isSelected = (muscleAlias: string) =>
    selectedMuscleGroups.includes(muscleAlias)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {selectedMuscleGroups.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-auto p-1 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(groupedMuscles).map(([groupSlug, muscles]) => (
          <div key={groupSlug} className="not-last:border-b pb-4">
            <h4 className="text-sm font-medium capitalize mb-2">{groupSlug}</h4>
            <div className="flex flex-wrap gap-1">
              {muscles.map((muscle) => (
                <Badge
                  key={muscle.id}
                  size="lg"
                  variant={
                    muscle.alias && isSelected(muscle.alias)
                      ? 'primary'
                      : 'secondary'
                  }
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={() =>
                    muscle.alias && onMuscleGroupToggle(muscle.alias)
                  }
                >
                  {muscle.alias}
                  {muscle.alias && isSelected(muscle.alias) && (
                    <XIcon className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
