'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import {
  type GQLWorkoutType,
  useUpdateTrainingDayDataMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { WorkoutTypeSelect } from '../../creator/components/days-setup/workout-type-select'
import { TrainingDay } from '../../creator/components/types'
import { dayNames } from '../../creator/components/utils'

import { SortableExercise } from './sortable-exercise'

interface DroppableDayProps {
  day: TrainingDay
  trainingPlanId?: string // Add this to help with query invalidation
}

// Custom hook for drag and drop logic
function useDragDropLogic(day: TrainingDay) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [isMouseOverColumn, setIsMouseOverColumn] = useState(false)

  const { active, over } = useDndContext()

  // Check if we're dragging a new exercise from sidebar
  const isDraggingNewExercise =
    active && active.data.current?.type !== 'day-exercise'

  // Check if we're dragging an existing exercise between days
  const isDraggingExistingExercise =
    active && active.data.current?.type === 'day-exercise'

  // Check if we're dragging any item that could be dropped on this day
  const isDraggingAnyItem = isDraggingNewExercise || isDraggingExistingExercise

  // Track mouse position over the column
  useEffect(() => {
    if (!isDraggingAnyItem) {
      setIsMouseOverColumn(false)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      setIsMouseOverColumn(isOver)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [isDraggingAnyItem])

  // Calculate insertion index
  useEffect(() => {
    if (!isDraggingAnyItem || !over || day.isRestDay || !isMouseOverColumn) {
      setDraggedOverIndex(null)
      return
    }

    // For existing exercises, check if we're dragging from the same day
    if (isDraggingExistingExercise) {
      const draggedExercise = active?.data.current?.exercise
      const isDraggingFromSameDay = day.exercises.some(
        (ex) => ex.id === draggedExercise?.id,
      )

      // If dragging from the same day, don't show indicators (handled by sortable)
      if (isDraggingFromSameDay) {
        setDraggedOverIndex(null)
        return
      }
    }

    // For empty days, show indicator at first position
    if (day.exercises.length === 0) {
      setDraggedOverIndex(0)
      return
    }

    const overData = over.data.current
    let insertIndex = null

    if (overData?.type === 'day-exercise') {
      // Find the exercise index in this day
      const exerciseIndex = day.exercises.findIndex(
        (ex) => ex.id === overData.exercise.id,
      )
      if (exerciseIndex !== -1) {
        insertIndex = exerciseIndex
      }
    } else if (over.id === day.id) {
      // Dropping directly on the day container
      insertIndex = day.exercises.length
    }

    setDraggedOverIndex(insertIndex)
  }, [
    isDraggingAnyItem,
    isDraggingExistingExercise,
    over,
    day,
    isMouseOverColumn,
    active,
  ])

  return {
    containerRef,
    draggedOverIndex,
    isDraggingNewExercise,
    isDraggingExistingExercise,
  }
}

// Improved insertion indicator with better visual feedback
export function InsertionIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden',
        isActive ? 'h-[120px] mb-2' : 'h-0',
      )}
    >
      <div className="relative h-[120px]">
        <div
          className={cn(
            'absolute inset-0 bg-primary/20 border-2 border-dashed border-primary/50 rounded-lg transition-all duration-300',
            isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          )}
        >
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                Drop exercise here
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export function InsertionIndicatorBlank({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden',
        isActive ? 'min-h-[120px] mb-2' : 'h-0',
      )}
    >
      <div className="relative h-full">
        <div
          className={cn(
            'absolute inset-0 bg-zinc-800 border-zinc-800 rounded-lg transition-all duration-300 h-full',
            isActive ? 'opacity-100 scale-100' : '',
          )}
        ></div>
      </div>
    </div>
  )
}

// Day header component
function DayHeader({
  day,
  onToggleRestDay,
  onUpdateWorkoutType,
}: {
  day: TrainingDay
  onToggleRestDay: () => void
  onUpdateWorkoutType: (workoutType: GQLWorkoutType | null) => void
}) {
  const { activeDay } = useTrainingPlan()

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
      <div className="flex items-center gap-2">
        <Checkbox checked={!day.isRestDay} onCheckedChange={onToggleRestDay} />
        <span className="font-medium text-sm py-3">
          {dayNames[day.dayOfWeek]}
        </span>
      </div>
      {!day.isRestDay && (
        <WorkoutTypeSelect
          dayIndex={activeDay}
          day={day}
          onUpdate={onUpdateWorkoutType}
        />
      )}
    </div>
  )
}

// Exercise list component
function ExerciseList({
  day,
  draggedOverIndex,
}: {
  day: TrainingDay
  draggedOverIndex: number | null
}) {
  return (
    <div className="flex-1">
      <InsertionIndicator isActive={draggedOverIndex === 0} />

      <div className="min-h-[120px] py-2 rounded">
        <SortableContext
          items={day.exercises?.map((ex) => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.exercises?.map((exercise, index) => (
            <div key={exercise.id}>
              <div className="mb-2">
                <SortableExercise
                  exerciseId={exercise.id}
                  dayOfWeek={day.dayOfWeek}
                />
              </div>
              <InsertionIndicator isActive={draggedOverIndex === index + 1} />
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// Rest day content component
function RestDayContent() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium">
      Rest day
    </div>
  )
}

// Main component
export function DroppableDay({ day, trainingPlanId }: DroppableDayProps) {
  // Always use mutations now since we have real database IDs
  const queryClient = useQueryClient()
  const { mutate: updateTrainingDayData } = useUpdateTrainingDayDataMutation()
  const { updateDay, activeWeek } = useTrainingPlan() // Keep context for fallback only
  const { containerRef, draggedOverIndex } = useDragDropLogic(day)

  const { setNodeRef } = useDroppable({
    id: day.id,
    disabled: day.isRestDay,
    data: {
      type: 'day',
      day: day,
    },
  })

  const invalidateQueries = useCallback(() => {
    if (trainingPlanId) {
      queryClient.invalidateQueries({
        queryKey: ['GetTemplateTrainingPlanById', { id: trainingPlanId }],
      })
      queryClient.invalidateQueries({
        queryKey: ['GetTrainingPlanPreviewById', { id: trainingPlanId }],
      })
      queryClient.invalidateQueries({ queryKey: ['GetTemplates'] })
    }
  }, [queryClient, trainingPlanId])

  const handleToggleRestDay = useCallback(() => {
    // Always use mutation now since we have real database IDs
    updateTrainingDayData(
      {
        input: {
          dayId: day.id,
          isRestDay: !day.isRestDay,
        },
      },
      {
        onSuccess: () => {
          console.log('✅ Day rest status updated successfully')
          invalidateQueries()
        },
        onError: (error) => {
          console.error('❌ Failed to update day rest status:', error)
          // Fallback to context approach on error
          updateDay(activeWeek, day.dayOfWeek, {
            ...day,
            isRestDay: !day.isRestDay,
          })
        },
      },
    )
  }, [updateTrainingDayData, updateDay, day, activeWeek, invalidateQueries])

  const handleUpdateWorkoutType = useCallback(
    (workoutType: GQLWorkoutType | null) => {
      // Always use mutation now since we have real database IDs
      updateTrainingDayData(
        {
          input: {
            dayId: day.id,
            workoutType: workoutType,
          },
        },
        {
          onSuccess: () => {
            console.log('✅ Workout type updated successfully')
            invalidateQueries()
          },
          onError: (error) => {
            console.error('❌ Failed to update workout type:', error)
            // Fallback to context approach on error
            updateDay(activeWeek, day.dayOfWeek, {
              ...day,
              workoutType,
            })
          },
        },
      )
    },
    [updateTrainingDayData, updateDay, day, activeWeek, invalidateQueries],
  )

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        containerRef.current = node
      }}
      className="w-[260px] bg-neutral-950/30 px-4 py-2 rounded-lg"
    >
      <DayHeader
        day={day}
        onToggleRestDay={handleToggleRestDay}
        onUpdateWorkoutType={handleUpdateWorkoutType}
      />

      <div className={cn('flex grow', day.isRestDay && 'opacity-50')}>
        {day.isRestDay ? (
          <RestDayContent />
        ) : (
          <ExerciseList day={day} draggedOverIndex={draggedOverIndex} />
        )}
      </div>
    </div>
  )
}
