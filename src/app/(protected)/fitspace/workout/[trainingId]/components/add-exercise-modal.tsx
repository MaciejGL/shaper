import { AnimatePresence } from 'framer-motion'
import { uniq } from 'lodash'
import { PlusIcon, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { LazyEnhancedBodyView as EnhancedBodyView } from '@/components/human-body/lazy-enhanced-body-view'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLEquipment,
  useFitspaceAddExercisesToWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { ExercisesList } from './exercises-list'
import LazyEquipmentFilters from './lazy-equipment-filters'
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

  const allEquipment = useMemo(() => {
    return uniq(allExercises.flatMap((ex) => ex.equipment)).filter(
      Boolean,
    ) as GQLEquipment[]
  }, [allExercises])

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
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerTrigger asChild>
        <Button variant="secondary" iconStart={<Search />} className="grow">
          Find exercises
        </Button>
      </DrawerTrigger>
      <SimpleDrawerContent
        title="Add Exercise"
        footer={
          <Button
            onClick={handleAddExercise}
            disabled={!selectedExercises.length}
            loading={isAdding}
            iconStart={<PlusIcon />}
          >
            Add Exercise
          </Button>
        }
        className="pt-0 px-0"
      >
        <AnimatePresence mode="wait">
          {(selectedMuscleGroups.length > 0 ||
            selectedEquipment.length > 0) && (
            <div className="sticky top-0 bg-sidebar z-[100] -mx-4 px-8 py-2">
              <SelectedFilters
                selectedMuscleGroups={selectedMuscleGroups}
                selectedEquipment={selectedEquipment}
                onClearFilters={clearAllFilters}
                onEquipmentToggle={toggleEquipment}
                onMuscleGroupToggle={toggleMuscleGroup}
              />
            </div>
          )}
        </AnimatePresence>
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
              <LazyEquipmentFilters
                selectedEquipment={selectedEquipment}
                onEquipmentToggle={handleEquipmentToggle}
                equipment={allEquipment}
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
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                selectedExercises={selectedExercises}
                onExerciseSelect={handleExerciseSelect}
                filteredExercises={filteredExercises}
              />
            </div>
          </div>
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
