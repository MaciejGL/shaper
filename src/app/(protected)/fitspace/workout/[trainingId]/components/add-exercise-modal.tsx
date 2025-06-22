import { AnimatePresence } from 'framer-motion'
import { uniq } from 'lodash'
import { PlusIcon, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLEquipment,
  useFitspaceAddExercisesToWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { EquipmentFilters } from './equipment-filters'
import { ExercisesList } from './exercises-list'
import { SelectedFilters } from './selected-filters'

type AddExerciseModalProps = {
  handlePaginationClick: (
    exerciseId: string | null,
    type: 'prev' | 'next',
  ) => void
}
export function AddExerciseModal({
  handlePaginationClick,
}: AddExerciseModalProps) {
  const invalidateQuery = useInvalidateQuery()
  const { activeDay, plan } = useWorkout()
  const { data } = useFitspaceGetExercisesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { mutateAsync: addExercises, isPending: isAdding } =
    useFitspaceAddExercisesToWorkoutMutation({
      onSuccess: async (data) => {
        await invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: plan?.id ?? '',
          }),
        })
        handlePaginationClick(data.addExercisesToWorkout[0].id, 'prev')
      },
    })

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

      const matchesEquipment =
        selectedEquipment.length === 0 ||
        (ex.equipment && selectedEquipment.includes(ex.equipment))

      return matchesSearch && matchesMuscleGroup && matchesEquipment
    })
  }, [allExercises, searchTerm, selectedMuscleGroups, selectedEquipment])

  const ALL_MUSCLE_GROUPS =
    data?.muscleGroupCategories?.flatMap((category) => category.muscles) || []

  const handleClose = (boolean: boolean) => {
    setIsOpen(boolean)
    if (!boolean) {
      clearAllFilters()
    }
  }

  const handleAddExercise = async () => {
    if (!activeDay?.id || !selectedExercises.length) {
      return
    }

    await addExercises({
      input: {
        workoutId: activeDay?.id,
        exerciseIds: selectedExercises,
      },
    })
    setSelectedExercises([])
    setSearchTerm('')
    setSelectedMuscleGroups([])
    handleClose(false)
  }

  const handleMuscleGroupToggle = (alias: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(alias) ? prev.filter((g) => g !== alias) : [...prev, alias],
    )
  }

  const handleEquipmentToggle = (equipment: GQLEquipment) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment],
    )
  }

  const equipmentAvailable = useMemo(() => {
    return uniq(filteredExercises.flatMap((ex) => ex.equipment)).filter(
      Boolean,
    ) as GQLEquipment[]
  }, [filteredExercises])

  const clearAllFilters = () => {
    setSelectedMuscleGroups([])
    setSearchTerm('')
    setSelectedEquipment([])
    setSelectedExercises([])
  }

  const toggleEquipment = (equipment: GQLEquipment) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment],
    )
  }

  const toggleMuscleGroup = (muscleGroup: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(muscleGroup)
        ? prev.filter((g) => g !== muscleGroup)
        : [...prev, muscleGroup],
    )
  }

  const handleExerciseSelect = (exerciseId: string) => {
    const isAlreadySelected = selectedExercises.includes(exerciseId)
    if (isAlreadySelected) {
      setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId))
      return
    }

    if (selectedExercises.length >= 3) {
      toast.info('You can only add up to 3 exercises at a time')
      return
    }

    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="secondary" iconStart={<Search />} className="grow">
          Find exercises
        </Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Add Exercise" fullScreen className="px-0">
        <DialogHeader className="px-4">
          <DialogTitle>Add Exercise</DialogTitle>

          <AnimatePresence mode="wait">
            <SelectedFilters
              selectedMuscleGroups={selectedMuscleGroups}
              selectedEquipment={selectedEquipment}
              onClearFilters={clearAllFilters}
              onEquipmentToggle={toggleEquipment}
              onMuscleGroupToggle={toggleMuscleGroup}
            />
          </AnimatePresence>
        </DialogHeader>
        <div className="flex flex-col gap-6 overflow-y-auto">
          <div>
            <div className="py-6">
              <p className="text-md font-medium  mb-2 px-4">
                1. Choose muscle groups
              </p>
              <div className="">
                <EnhancedBodyView
                  selectedMuscleGroups={selectedMuscleGroups}
                  onMuscleGroupClick={handleMuscleGroupToggle}
                  muscleGroups={ALL_MUSCLE_GROUPS}
                />
              </div>
            </div>
            <div className="px-4">
              <p className="text-md font-medium  mb-2">2. Select equipment</p>
              <EquipmentFilters
                selectedEquipment={selectedEquipment}
                onEquipmentToggle={handleEquipmentToggle}
                equipment={equipmentAvailable}
              />
            </div>

            <div className="px-4 mt-8">
              <Input
                id="exercise-search"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                iconStart={<Search />}
              />
            </div>
            <div className="mt-2 px-4">
              <p className="text-md font-medium  mb-2">3. Choose an exercise</p>
              <ExercisesList
                selectedExercises={selectedExercises}
                onExerciseSelect={handleExerciseSelect}
                filteredExercises={filteredExercises}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="px-4">
          <Button
            onClick={handleAddExercise}
            disabled={!selectedExercises.length}
            loading={isAdding}
            iconStart={<PlusIcon />}
          >
            Add Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
