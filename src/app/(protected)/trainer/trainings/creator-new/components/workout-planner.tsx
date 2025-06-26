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
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'

import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingDay, TrainingExercise } from '../../creator/components/types'

import { DayGrid } from './day-grid'
import { DragOverlay as CustomDragOverlay } from './drag-overlay'
import { Sidebar } from './sidebar'
import { getNewOrder } from './utils'
import { WeekTabs } from './week-tabs'

export default function WorkoutPlanner() {
  const { formData, activeWeek, updateDay } = useTrainingPlan()

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

  // Improved reordering function using the new utility
  const reorderExercises = (
    dayOfWeek: number,
    exercises: TrainingExercise[],
  ) => {
    const day = formData.weeks[activeWeek].days.find(
      (d) => d.dayOfWeek === dayOfWeek,
    )
    if (!day) return

    // Use the new order calculation for all exercises
    const newExercises = exercises.map((exercise, index) => ({
      ...exercise,
      order: getNewOrder({
        orders: exercises.map((_, i) => i * 1024), // Create evenly spaced orders
        sourceIndex: null,
        destinationIndex: index,
      }),
    }))

    updateDay(activeWeek, dayOfWeek, {
      ...day,
      exercises: newExercises,
    })
  }

  // Improved insertion function using the new utility
  const insertExerciseAtPosition = (
    targetDay: TrainingDay,
    newExercise: Omit<TrainingExercise, 'order' | 'sets'>,
    position: number,
  ) => {
    const currentOrders = targetDay.exercises.map((ex) => ex.order)

    // Calculate new order using the improved utility
    const order = getNewOrder({
      orders: currentOrders,
      sourceIndex: null,
      destinationIndex: position,
    })

    // Create the new exercise with proper order
    const exerciseToInsert: TrainingExercise = {
      ...newExercise,
      id: `${newExercise.id}-${Date.now()}`,
      order,
      sets: [],
    }

    // Insert at the specified position
    const newExercises = [...targetDay.exercises]
    newExercises.splice(position, 0, exerciseToInsert)

    updateDay(activeWeek, targetDay.dayOfWeek, {
      ...targetDay,
      exercises: newExercises,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Handle reordering exercises within a day
    if (
      activeData?.type === 'day-exercise' &&
      overData?.type === 'day-exercise'
    ) {
      const activeExercise = activeData.exercise
      const overExercise = overData.exercise

      const currentWeek = formData.weeks[activeWeek]
      const day = currentWeek.days.find((d) =>
        d.exercises.some((ex) => ex.id === activeExercise.id),
      )

      if (day) {
        const oldIndex = day.exercises.findIndex(
          (ex) => ex.id === activeExercise.id,
        )
        const newIndex = day.exercises.findIndex(
          (ex) => ex.id === overExercise.id,
        )

        if (oldIndex !== newIndex) {
          const reorderedExercises = arrayMove(
            day.exercises,
            oldIndex,
            newIndex,
          )
          reorderExercises(day.dayOfWeek, reorderedExercises)
        }
      }
      return
    }

    // Handle dropping new exercises from sidebar
    const activeExercise = joinedExercises.find((ex) => ex.id === active.id)
    if (!activeExercise) return

    // Only proceed if we have overData with a specific type - this ensures we're actually over a valid drop zone
    if (!overData || !overData.type) {
      return // No drop if no valid overData
    }

    const currentWeek = formData.weeks[activeWeek]
    let targetDay = null
    let insertPosition = -1

    // Only proceed if we have valid drop data with explicit types
    if (overData.type === 'day') {
      targetDay = overData.day
      insertPosition = targetDay.exercises.length // Add to end
    } else if (overData.type === 'day-exercise') {
      // Find the day that contains this exercise
      targetDay = currentWeek.days.find((day) =>
        day.exercises.some((ex) => ex.id === overData.exercise.id),
      )
      if (targetDay) {
        insertPosition = targetDay.exercises.findIndex(
          (ex) => ex.id === overData.exercise.id,
        )
      }
    }
    // Removed the else case completely - no more fallbacks!

    // Only proceed if we have a valid target day, it's not a rest day, and we have a valid position
    if (targetDay && !targetDay.isRestDay && insertPosition >= 0) {
      insertExerciseAtPosition(targetDay, activeExercise, insertPosition)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full">
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
  )
}
