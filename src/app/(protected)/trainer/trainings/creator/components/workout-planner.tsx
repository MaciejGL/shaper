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
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { PartialTrainingPlanFormDataExercise } from '@/context/training-plan-context/types'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'
import { createId } from '@/lib/create-id'

import { DashboardHeader } from '../../../components/dashboard-header'
import { FormActions } from '../../creator-old/components/create-training-plan-form/form-actions'
import { PlanDetailsForm } from '../../creator-old/components/plan-details-form'
import { TrainingDay } from '../../creator-old/components/types'

import { DayGrid } from './day-grid'
import { DragOverlay as CustomDragOverlay } from './drag-overlay'
import { Sidebar } from './sidebar'
import { WeekTabs } from './week-tabs'

export default function WorkoutPlanner() {
  const {
    formData,
    activeWeek,
    addExercise,
    moveExercise,
    updateDetails,
    isDirty,
    trainingId,
    isPending,
    isUpdating,
    isDuplicating,
    isDeleting,
    clearDraft,
    handleDelete,
    handleDuplicate,
    handleSubmit,
  } = useTrainingPlan()

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
    const exerciseToAdd: PartialTrainingPlanFormDataExercise = {
      baseId: newExercise.id,
      name: newExercise.name,
      videoUrl: newExercise.videoUrl || '',
      instructions: newExercise.description || '',
      order: (targetPosition || 0) + 1, // Simple ordering
      sets: [
        {
          id: createId(),
          order: 1,
          minReps: undefined,
          maxReps: undefined,
          weight: undefined,
        },
      ], // Start with empty sets, user can add them later
    }

    // Use context's addExercise function - same as exercise form
    addExercise(activeWeek, targetDay.dayOfWeek, exerciseToAdd, targetPosition)
  }

  return (
    <Tabs defaultValue="details" className="h-full flex flex-col">
      <div>
        <div className="flex justify-between items-baseline">
          <DashboardHeader
            title="Training Plan Creator"
            description={`${formData.details.title}`}
            prevSegment={{
              label: 'Training Plans',
              href: '/trainer/trainings',
            }}
            className="mb-2 mt-0"
          />
        </div>
        <div className="flex justify-between items-end">
          <TabsList size="lg">
            <TabsTrigger size="lg" value="details">
              Training Informations
            </TabsTrigger>
            <TabsTrigger size="lg" value="weeks">
              Workout Planner
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <AnimatePresence>
              {isDirty && (
                <motion.p
                  key="unsaved-changes"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="text-sm text-amber-500 text-right mb-2 absolute -top-8 right-0"
                >
                  Unsaved changes
                </motion.p>
              )}
            </AnimatePresence>
            <FormActions
              isDirty={isDirty}
              trainingId={trainingId}
              isPending={isPending}
              isUpdating={isUpdating}
              isDuplicating={isDuplicating}
              isDeleting={isDeleting}
              onDelete={handleDelete}
              onClearDraft={clearDraft}
              onDuplicate={handleDuplicate}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
      <TabsContent value="details" className="flex-1 border-t mt-4 p-4">
        <PlanDetailsForm data={formData.details} updateData={updateDetails} />
      </TabsContent>
      <TabsContent value="weeks" className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full w-full">
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

            <div className="grid grid-cols-1 grid-rows-[auto_1fr] pl-6 ">
              <WeekTabs />
              <div className="overflow-x-auto pr-6 hide-scrollbar ">
                <DayGrid />
              </div>
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
