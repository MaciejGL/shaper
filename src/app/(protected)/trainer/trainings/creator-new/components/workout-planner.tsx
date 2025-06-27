'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'

import { PlanDetailsForm } from '../../creator/components/plan-details-form'
import { TrainingDay } from '../../creator/components/types'

import { DayGrid } from './day-grid'
import { DragOverlay as CustomDragOverlay } from './drag-overlay'
import { Sidebar } from './sidebar'
import { WeekTabs } from './week-tabs'

export default function WorkoutPlanner() {
  const { formData, activeWeek, addExercise, moveExercise, updateDetails } =
    useTrainingPlan()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all')
  const [selectedEquipment, setSelectedEquipment] = useState('all')

  const { data: exercisesData, isLoading: exercisesLoading } =
    useTrainerExercisesQuery()

  const joinedExercises = [
    ...(exercisesData?.userExercises || []),
    ...(exercisesData?.publicExercises || []),
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // // Improved reordering function using the new utility
  // const reorderExercises = (
  //   dayOfWeek: number,
  //   exercises: TrainingExercise[],
  // ) => {
  //   const day = formData.weeks[activeWeek].days.find(
  //     (d) => d.dayOfWeek === dayOfWeek,
  //   )
  //   if (!day) return

  //   // Use the new order calculation for all exercises
  //   const newExercises = exercises?.map((exercise, index) => ({
  //     ...exercise,
  //     order: getNewOrder({
  //       orders: exercises.map((_, i) => i * 1024), // Create evenly spaced orders
  //       sourceIndex: null,
  //       destinationIndex: index,
  //     }),
  //   }))

  //   updateDay(activeWeek, dayOfWeek, {
  //     ...day,
  //     exercises: newExercises,
  //   })
  // }

  // // Improved insertion function using the new utility
  // const insertExerciseAtPosition = (
  //   targetDay: TrainingDay,
  //   newExercise: Omit<TrainingExercise, 'order' | 'sets'>,
  //   position: number,
  // ) => {
  //   const currentOrders = targetDay.exercises?.map((ex) => ex.order)

  //   // Calculate new order using the improved utility
  //   const order = getNewOrder({
  //     orders: currentOrders,
  //     sourceIndex: null,
  //     destinationIndex: position,
  //   })

  //   // Create the new exercise with proper order
  //   const exerciseToInsert: TrainingExercise = {
  //     ...newExercise,
  //     id: `${newExercise.id}-${Date.now()}`,
  //     order,
  //     sets: [],
  //   }

  //   // Insert at the specified position
  //   const newExercises = [...(targetDay.exercises || [])]
  //   newExercises.splice(position, 0, exerciseToInsert)

  //   updateDay(activeWeek, targetDay.dayOfWeek, {
  //     ...targetDay,
  //     exercises: newExercises,
  //   })
  // }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Ensure we have a valid drop target
    if (
      !overData?.type ||
      (overData.type === 'day' && overData.day?.isRestDay)
    ) {
      return
    }

    // Determine target day and position
    let targetDay: TrainingDay | null = null
    let targetPosition = 0

    if (overData.type === 'day') {
      targetDay = overData.day
      targetPosition = targetDay?.exercises?.length || 0
    } else if (overData.type === 'day-exercise') {
      // Find the day containing the target exercise
      const currentWeek = formData.weeks[activeWeek]
      targetDay =
        currentWeek.days.find((day) =>
          day.exercises?.some((ex) => ex.id === overData.exercise.id),
        ) || null
      if (targetDay) {
        targetPosition =
          targetDay.exercises?.findIndex(
            (ex) => ex.id === overData.exercise.id,
          ) || 0
      }
    }

    if (!targetDay) return

    // Handle moving existing exercises (from day to day)
    if (activeData?.type === 'day-exercise') {
      const activeExercise = activeData.exercise
      const currentWeek = formData.weeks[activeWeek]

      // Find source day and exercise index
      const sourceDay = currentWeek.days.find((d) =>
        d.exercises?.some((ex) => ex.id === activeExercise.id),
      )

      if (!sourceDay) return

      const sourceExerciseIndex = sourceDay.exercises?.findIndex(
        (ex) => ex.id === activeExercise.id,
      )

      if (sourceExerciseIndex === -1) return

      // Use context's moveExercise function - it handles both same-day reordering and cross-day moves
      moveExercise(
        activeWeek, // sourceWeekIndex
        sourceDay.dayOfWeek, // sourceDayIndex
        sourceExerciseIndex, // sourceExerciseIndex
        activeWeek, // targetWeekIndex
        targetDay.dayOfWeek, // targetDayIndex
        targetPosition, // targetExerciseIndex
      )
      return
    }

    // Handle dropping new exercises from sidebar
    const newExercise = joinedExercises.find((ex) => ex.id === active.id)
    if (!newExercise) return

    // Create exercise object similar to exercise form
    const exerciseToAdd = {
      ...newExercise,
      baseId: newExercise.id,
      instructions: newExercise.description || '',
      sets: [], // Start with empty sets, user can add them later
      order: (targetPosition || 0) + 1, // Simple ordering
    }

    // Use context's addExercise function - same as exercise form
    addExercise(activeWeek, targetDay.dayOfWeek, exerciseToAdd, targetPosition)
  }

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="weeks">Weeks</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <PlanDetailsForm data={formData.details} updateData={updateDetails} />
      </TabsContent>
      <TabsContent value="weeks">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-[auto_1fr] h-full">
            <Sidebar
              searchTerm={searchTerm}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              exercises={joinedExercises}
              isLoading={exercisesLoading}
              onSearchChange={setSearchTerm}
              onMuscleGroupChange={setSelectedMuscleGroup}
              onEquipmentChange={setSelectedEquipment}
            />

            <div className="flex flex-col pl-6 overflow-y-auto h-full w-max">
              <WeekTabs />
              <DayGrid />
            </div>
          </div>

          <DragOverlay>
            <CustomDragOverlay
              activeId={activeId}
              exercises={joinedExercises}
              weeks={formData.weeks}
              activeWeek={activeWeek}
            />
          </DragOverlay>
        </DndContext>
      </TabsContent>
    </Tabs>
  )
}
