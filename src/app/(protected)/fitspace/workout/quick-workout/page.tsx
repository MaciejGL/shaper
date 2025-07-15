'use client'

import { Reorder } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import {
  GQLEquipment,
  useAddExercisesToQuickWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { EquipmentFilters } from '../[trainingId]/components/equipment-filters'
import { ExercisesList } from '../[trainingId]/components/exercises-list'

import { Exercise, ExerciseCard } from './components/exercise-card'
import { QuickWorkoutWizard } from './components/quick-workout-wizard'

export default function QuickWorkoutPage() {
  const router = useRouter()
  const { data } = useFitspaceGetExercisesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
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
    return allExercises
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
            (group) =>
              group.alias && selectedMuscleGroups.includes(group.alias),
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
  }, [allExercises, searchTerm, selectedMuscleGroups, selectedEquipment])

  const ALL_MUSCLE_GROUPS =
    data?.muscleGroupCategories?.flatMap((category) => category.muscles) || []

  const handleAddExercise = async () => {
    try {
      await addExercises({
        exerciseIds: selectedExercises.map((exercise) => exercise.id),
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

  const allEquipment = EQUIPMENT_OPTIONS.map((equipment) => equipment.value)

  const handleExerciseSelect = (exerciseId: string) => {
    const exercise = allExercises.find((ex) => ex.id === exerciseId)
    if (!exercise) return

    const isAlreadySelected = selectedExercises.some(
      (selectedExercise) => selectedExercise.id === exerciseId,
    )

    if (isAlreadySelected) {
      setSelectedExercises((prev) =>
        prev.filter((selectedExercise) => selectedExercise.id !== exerciseId),
      )
      return
    }

    if (selectedExercises.length >= 10) {
      toast.info('You can only add up to 10 exercises at a time')
      return
    }

    setSelectedExercises((prev) => [...prev, exercise])
  }

  return (
    <div className="pb-[80px] space-y-6">
      <QuickWorkoutWizard
        isAdding={isAdding}
        onFinish={handleAddExercise}
        muscleGroupsComponent={
          <EnhancedBodyView
            selectedMuscleGroups={selectedMuscleGroups}
            onMuscleGroupClick={handleMuscleGroupToggle}
            muscleGroups={ALL_MUSCLE_GROUPS}
          />
        }
        equipmentComponent={
          <EquipmentFilters
            selectedEquipment={selectedEquipment}
            onEquipmentToggle={handleEquipmentToggle}
            equipment={allEquipment}
            variant="cards"
          />
        }
        exercisesComponent={
          <ExercisesList
            selectedExercises={selectedExercises.map((exercise) => exercise.id)}
            onExerciseSelect={handleExerciseSelect}
            filteredExercises={filteredExercises}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
          />
        }
        reviewComponent={
          <div className="space-y-4">
            <Reorder.Group
              axis="y"
              values={selectedExercises}
              onReorder={setSelectedExercises}
              className="space-y-3"
            >
              {selectedExercises.map((exercise) => (
                <Reorder.Item
                  key={exercise.id}
                  value={exercise}
                  dragElastic={0.1}
                >
                  <ExerciseCard
                    exercise={exercise}
                    onExerciseRemove={handleExerciseSelect}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        }
      />
    </div>
  )
}
