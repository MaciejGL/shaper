'use client'

import { Reorder } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EnhancedBodyView } from '@/components/human-body/enhanced-body-view'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import {
  GQLEquipment,
  GQLTrainingPlan,
  useAddExercisesToQuickWorkoutMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { EquipmentFilters } from '../[trainingId]/components/equipment-filters'
import { ExercisesList } from '../[trainingId]/components/exercises-list'

import { Exercise, ExerciseCard } from './components/exercise-card'
import { ExistingWorkoutView } from './components/existing-workout-view'
import {
  QuickWorkoutWizard,
  QuickWorkoutWizardSkeleton,
} from './components/quick-workout-wizard'
import {
  getTodaysWorkoutExercises,
  hasTodaysWorkoutExercises,
} from './utils/workout-utils'

export default function QuickWorkoutPage() {
  const router = useRouter()
  const { data } = useFitspaceGetExercisesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<GQLEquipment[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const invalidateQuery = useInvalidateQuery()
  const { data: quickWorkoutPlanData, isLoading: isLoadingQuickWorkoutPlan } =
    useFitspaceGetUserQuickWorkoutPlanQuery(
      {},
      {
        refetchOnMount: true,
      },
    )

  const { mutateAsync: addExercises, isPending: isAdding } =
    useAddExercisesToQuickWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
        })
      },
    })

  const { mutateAsync: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetUserQuickWorkoutPlanQuery.getKey(),
        })
      },
    })

  const quickWorkoutPlan = useMemo(() => {
    return quickWorkoutPlanData?.getQuickWorkoutPlan
  }, [quickWorkoutPlanData])

  // Check if there's already a workout for today
  const hasExistingWorkout = useMemo(() => {
    return hasTodaysWorkoutExercises(quickWorkoutPlan as GQLTrainingPlan)
  }, [quickWorkoutPlan])

  // Show wizard if explicitly requested or if no existing workout
  const shouldShowWizard = showWizard || !hasExistingWorkout

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
        exercises: selectedExercises.map((exercise, index) => ({
          exerciseId: exercise.id,
          order: index + 1, // Use 1-based ordering to match the user's visual sequence
        })),
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

  const handleContinueWorkout = () => {
    router.push(`/fitspace/workout/${quickWorkoutPlan?.id}`)
  }

  const handleCreateNewWorkout = () => {
    setShowWizard(true)
  }
  const todaysWorkout = quickWorkoutPlan
    ? getTodaysWorkoutExercises(quickWorkoutPlan)
    : null

  return (
    <div className="pb-[80px] space-y-6">
      {isLoadingQuickWorkoutPlan ? (
        <QuickWorkoutWizardSkeleton />
      ) : shouldShowWizard ? (
        <QuickWorkoutWizard
          isAdding={isAdding}
          onFinish={handleAddExercise}
          hasExistingWorkout={hasExistingWorkout}
          onStepChange={(step) => {
            if (step === -1) {
              setShowWizard(false)
            }
          }}
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
              selectedExercises={selectedExercises.map(
                (exercise) => exercise.id,
              )}
              onExerciseSelect={handleExerciseSelect}
              filteredExercises={filteredExercises}
              onSearch={setSearchTerm}
              searchTerm={searchTerm}
            />
          }
          reviewComponent={
            <div className="space-y-4">
              {(todaysWorkout?.exercises.length ?? 0) > 0 && (
                <div>
                  <p className="text-md font-medium">Already added exercises</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Exercises that already exist in your workout for today.
                  </p>
                  <div className="space-y-3">
                    {todaysWorkout?.exercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        selectedExercises={todaysWorkout?.exercises
                          .filter((ex) => ex.completedAt)
                          .map((ex) => ex.id)}
                        onExerciseRemove={() => {
                          removeExercise({ exerciseId: exercise.id })
                        }}
                        loading={isRemoving}
                      />
                    ))}
                  </div>
                </div>
              )}
              {(todaysWorkout?.exercises.length ?? 0) > 0 && (
                <div className="mb-2">
                  <p className="text-md font-medium">New exercises</p>
                  {selectedExercises.length === 0 && (
                    <div className="text-sm text-muted-foreground bg-card p-4 rounded-lg mt-2">
                      You haven't selected any new exercises yet.
                    </div>
                  )}
                </div>
              )}

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
                      isDraggable
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          }
        />
      ) : (
        <ExistingWorkoutView
          quickWorkoutPlan={quickWorkoutPlan}
          onContinueWorkout={handleContinueWorkout}
          onCreateNewWorkout={handleCreateNewWorkout}
        />
      )}
    </div>
  )
}
