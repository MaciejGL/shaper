'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { DumbbellIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import React, { useState } from 'react'

import { DashboardHeader } from '@/app/(protected)/trainer/components/dashboard-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { useTrainerExercisesQuery } from '@/generated/graphql-client'
import { GQLAddExerciseToDayInput } from '@/generated/graphql-server'

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
    formData,
    trainingId,
    activeWeek,
    isDeletingTrainingPlan,
    isDuplicatingTrainingPlan,
    isLoadingInitialData,
    addExercise,
    moveExercise,
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
    useTrainerExercisesQuery(
      {},
      {
        refetchOnWindowFocus: false,
      },
    )

  const joinedExercises = [
    ...(exercisesData?.userExercises || []),
    ...(exercisesData?.publicExercises || []),
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !formData) {
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

    const exerciseToAdd: Omit<GQLAddExerciseToDayInput, 'dayId'> = {
      baseId: newExercise.id,
      name: newExercise.name,
      description: newExercise.description || '',
      instructions: newExercise.instructions || [],
      tips: newExercise.tips || [],
      difficulty: newExercise.difficulty || null,
      additionalInstructions: undefined,
      restSeconds: undefined,
      tempo: undefined,
      type: undefined,
      warmupSets: undefined,
      order: targetPosition + 1,
    }

    addExercise(activeWeek, targetDay.dayOfWeek, exerciseToAdd)
  }

  // Show loading state while data is loading
  if (isLoadingInitialData || !formData) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-baseline">
          <DashboardHeader
            title="Workout Editor"
            icon={DumbbellIcon}
            prevSegment={{
              label: 'Training Plans',
              href: '/trainer/trainings',
            }}
            className="mb-10 mt-0"
          />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <Tabs
      defaultValue={tab}
      onValueChange={(value) => setTab(value as Tab)}
      className="h-full flex flex-col"
    >
      <div>
        <div className="flex justify-between items-baseline">
          <div className="flex items-center gap-3">
            <DashboardHeader
              title={`Workout Editor ${formData.details.title ? `- ${formData.details.title}` : ''}`}
              icon={DumbbellIcon}
              prevSegment={{
                label: 'Training Plans',
                href: '/trainer/trainings',
              }}
              className="mb-10 mt-0"
            />
          </div>
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
          <div className="relative flex items-center gap-2">
            <FormActions
              trainingId={trainingId}
              isDuplicating={isDuplicatingTrainingPlan}
              isDeleting={isDeletingTrainingPlan}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>
        </div>
      </div>
      <TabsContent value="details" className="">
        <PlanDetailsForm />
      </TabsContent>
      <TabsContent value="weeks" className="flex-1 -mr-8 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full w-full min-h-0">
            <Sidebar
              searchTerm={searchTerm}
              selectedMuscleGroup={selectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              trainerExercises={exercisesData?.userExercises || []}
              publicExercises={exercisesData?.publicExercises || []}
              isLoading={exercisesLoading}
              onSearchChange={setSearchTerm}
              onMuscleGroupChange={setSelectedMuscleGroup}
              onEquipmentChange={setSelectedEquipment}
            />

            <div className="grid grid-cols-1 grid-rows-[auto_1fr] pl-4">
              <div className="overflow-x-auto hide-scrollbar  pr-8">
                <WeekTabs />
              </div>
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
