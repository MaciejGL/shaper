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
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { PartialTrainingPlanFormDataExercise } from '@/context/training-plan-context/types'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'
import { createId } from '@/lib/create-id'

import { DashboardHeader } from '../../../components/dashboard-header'
import { TrainingDay } from '../../../types'

import { DayGrid } from './day-grid'
import { DragOverlay as CustomDragOverlay } from './drag-overlay'
import { FormActions } from './form-actions'
import { PlanDetailsForm } from './plan-details-form'
import { Sidebar } from './sidebar'
import { WeekTabs } from './week-tabs'

enum Tab {
  Details = 'details',
  Weeks = 'weeks',
}

export default function WorkoutPlanner() {
  const {
    createdAt,
    updatedAt,
    assignedCount,

    formData,
    activeWeek,
    isDirty,
    trainingId,
    isDeletingTrainingPlan,
    isDuplicatingTrainingPlan,
    addExercise,
    moveExercise,
    updateDetails,
    clearDraft,
    handleDelete,
    handleDuplicate,
  } = useTrainingPlan()

  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<Tab>(Object.values(Tab)).withDefault(Tab.Details),
  )

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
        distance: 8,
        tolerance: 5,
        delay: 50,
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

    if (!over) {
      return
    }

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
      // With new stable keys, we have position info directly in the data
      const currentWeek = formData.weeks[activeWeek]
      targetDay =
        currentWeek.days.find((d) => d.dayOfWeek === overData.dayIndex) || null
      targetPosition = overData.exerciseIndex || 0
    }

    if (!targetDay) return

    // Handle moving existing exercises (from day to day)
    if (activeData?.type === 'day-exercise') {
      // With new stable keys, we have position info directly in the data
      const sourceWeekIndex = activeData.weekIndex
      const sourceDayIndex = activeData.dayIndex
      const sourceExerciseIndex = activeData.exerciseIndex

      // Use context's moveExercise function
      moveExercise(
        sourceWeekIndex,
        sourceDayIndex,
        sourceExerciseIndex,
        activeWeek, // targetWeekIndex
        targetDay.dayOfWeek, // targetDayIndex
        targetPosition, // targetExerciseIndex
      )
      return
    }

    // Handle dropping new exercises from sidebar
    const newExercise = joinedExercises.find((ex) => ex.id === active.id)
    if (!newExercise) return

    const exerciseToAdd: PartialTrainingPlanFormDataExercise = {
      baseId: newExercise.id,
      name: newExercise.name,
      videoUrl: newExercise.videoUrl || '',
      instructions: newExercise.description || '',
      order: (targetPosition || 0) + 1,
      sets: [
        {
          id: createId(),
          order: 1,
          minReps: undefined,
          maxReps: undefined,
          weight: undefined,
        },
      ],
    }

    addExercise(activeWeek, targetDay.dayOfWeek, exerciseToAdd, targetPosition)
  }

  return (
    <Tabs
      defaultValue={tab}
      onValueChange={(value) => setTab(value as Tab)}
      className="h-full flex flex-col"
    >
      <div>
        <div className="flex justify-between items-baseline">
          <DashboardHeader
            title={`Workout Editor ${formData.details.title ? `- ${formData.details.title}` : ''}`}
            prevSegment={{
              label: 'Training Plans',
              href: '/trainer/trainings',
            }}
            className="mb-10 mt-0"
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
            <FormActions
              isDirty={isDirty}
              trainingId={trainingId}
              isDuplicating={isDuplicatingTrainingPlan}
              isDeleting={isDeletingTrainingPlan}
              onDelete={handleDelete}
              onClearDraft={clearDraft}
              onDuplicate={handleDuplicate}
            />
          </div>
        </div>
      </div>
      <TabsContent value="details" className="">
        <PlanDetailsForm
          data={formData.details}
          updateData={updateDetails}
          createdAt={createdAt}
          updatedAt={updatedAt}
          assignedCount={assignedCount}
        />
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
