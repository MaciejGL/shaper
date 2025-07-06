'use client'

import { AnimatePresence } from 'framer-motion'
import { uniq } from 'lodash'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  // GQLAddExerciseToDayInput,
  // GQLAssignTrainingPlanToClientInput,
  // GQLCreateTrainingPlanInput,
  GQLEquipment,
  useAddExercisesToQuickWorkoutMutation,
  // useAddExerciseToQuickWorkoutMutation,
  // useAssignQuickWorkoutPlanMutation,
  // useCreateQuickWorkoutPlanMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
  // useFitspaceGetWorkoutQuery,
  // useGetUserQuickWorkoutPlanQuery,
  // useMuscleGroupCategoriesQuery,
  // useQuickWorkoutExercisesQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { EquipmentFilters } from '../[trainingId]/components/equipment-filters'
import { ExercisesList } from '../[trainingId]/components/exercises-list'
import { SelectedFilters } from '../[trainingId]/components/selected-filters'

export default function QuickWorkoutPage() {
  const router = useRouter()
  const { data } = useFitspaceGetExercisesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])
  const invalidateQuery = useInvalidateQuery()
  const { data: quickWorkoutPlanData } =
    useFitspaceGetUserQuickWorkoutPlanQuery()

  const { mutateAsync: addExercises, isPending: isAdding } =
    useAddExercisesToQuickWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: ['getQuickWorkoutPlan'],
        })
      },
    })

  const quickWorkoutPlan = useMemo(() => {
    return quickWorkoutPlanData?.getQuickWorkoutPlan
  }, [quickWorkoutPlanData])

  const allExercises = useMemo(
    () => [...(data?.getExercises?.publicExercises || [])],
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

  const handleAddExercise = async () => {
    try {
      await addExercises({
        exerciseIds: selectedExercises,
      })

      router.push(`/fitspace/workout/${quickWorkoutPlan?.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to add exercises')
    }
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

    if (selectedExercises.length >= 10) {
      toast.info('You can only add up to 10 exercises at a time')
      return
    }

    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    )
  }

  const handleExerciseMove = (exerciseId: string, direction: 'up' | 'down') => {
    setSelectedExercises((prev) => {
      const index = prev.indexOf(exerciseId)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      const newArray = [...prev]
      newArray[index] = newArray[newIndex]
      newArray[newIndex] = exerciseId
      return newArray
    })
  }

  return (
    <div className="container pb-[100px] space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Quick Workout</h1>
        <p className="text-muted-foreground">
          Create your custom workout for today
        </p>
      </div>

      {/* Exercise Search */}
      <AnimatePresence mode="wait">
        {(selectedMuscleGroups.length > 0 || selectedEquipment.length > 0) && (
          <div className="sticky top-[-8px] bg-sidebar z-[100] -mx-2 px-2 py-2">
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
            <p className="text-md font-medium  mb-2">1. Choose muscle groups</p>
            <div>
              <EnhancedBodyView
                selectedMuscleGroups={selectedMuscleGroups}
                onMuscleGroupClick={handleMuscleGroupToggle}
                muscleGroups={ALL_MUSCLE_GROUPS}
              />
            </div>
          </div>
          <div>
            <p className="text-md font-medium  mb-2">2. Select equipment</p>
            <EquipmentFilters
              selectedEquipment={selectedEquipment}
              onEquipmentToggle={handleEquipmentToggle}
              equipment={allEquipment}
            />
          </div>

          <div className=" mt-8">
            <Input
              id="exercise-search"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconStart={<Search />}
            />
          </div>
          <div className="mt-2">
            <p className="text-md font-medium  mb-2">3. Choose an exercise</p>
            <div className="max-h-[400px] overflow-y-auto border rounded-md p-2">
              <ExercisesList
                selectedExercises={selectedExercises}
                onExerciseSelect={handleExerciseSelect}
                filteredExercises={filteredExercises}
              />
            </div>
          </div>
          <div className="mt-2"></div>
        </div>
      </div>
      <p className="text-md font-medium">Your Quick Workout</p>
      <span className="text-sm text-muted-foreground">
        {selectedExercises.length} exercise
        {selectedExercises.length !== 1 ? 's' : ''}
      </span>
      {selectedExercises.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No exercises selected yet</p>
          <p className="text-sm mt-2">
            Select exercises from the left panel to build your workout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto border rounded-md p-2">
            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 p-3 border rounded-lg"
                >
                  <div className="flex flex-col items-center gap-2 ">
                    {index > 0 && (
                      <Button
                        variant="secondary"
                        size="xs"
                        iconOnly={<ChevronUp />}
                        onClick={() => handleExerciseMove(exercise, 'up')}
                      />
                    )}
                    {index < selectedExercises.length - 1 && (
                      <Button
                        variant="secondary"
                        size="xs"
                        iconOnly={<ChevronDown />}
                        onClick={() => handleExerciseMove(exercise, 'down')}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {index + 1}.{' '}
                      {allExercises.find((ex) => ex.id === exercise)?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedExercises((prev) =>
                          prev.filter((id) => id !== exercise),
                        )
                      }
                      iconOnly={<X />}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save and Start */}

      <div className="flex justify-center">
        <Button
          onClick={handleAddExercise}
          loading={isAdding}
          size="lg"
          disabled={selectedExercises.length === 0}
        >
          Save & Start Workout
        </Button>
      </div>
    </div>
  )
}
