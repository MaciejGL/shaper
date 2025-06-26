'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { WorkoutTypeSelect } from '../../creator/components/days-setup/workout-type-select'
import { TrainingDay } from '../../creator/components/types'
import { dayNames } from '../../creator/components/utils'

import { SortableExercise } from './sortable-exercise'

interface DroppableDayProps {
  day: TrainingDay
}

// Custom hook for drag and drop logic
function useDragDropLogic(day: TrainingDay) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)
  const [isMouseOverColumn, setIsMouseOverColumn] = useState(false)

  const { active, over } = useDndContext()

  const isDraggingNewExercise =
    active && active.data.current?.type !== 'day-exercise'

  // Track mouse position over the column
  useEffect(() => {
    if (!isDraggingNewExercise) {
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
  }, [isDraggingNewExercise])

  // Calculate insertion index
  useEffect(() => {
    if (
      !isDraggingNewExercise ||
      !over ||
      day.isRestDay ||
      !isMouseOverColumn
    ) {
      setDraggedOverIndex(null)
      return
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
  }, [isDraggingNewExercise, over, day, isMouseOverColumn])

  return {
    containerRef,
    draggedOverIndex,
    isDraggingNewExercise,
  }
}

// Insertion indicator component
function InsertionIndicator({ isActive }: { isActive: boolean }) {
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
            'absolute inset-0 bg-neutral-950/30 rounded-lg transition-all duration-300',
            isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          )}
        />
      </div>
    </div>
  )
}

// Day header component
function DayHeader({
  day,
  onToggleRestDay,
}: {
  day: TrainingDay
  onToggleRestDay: () => void
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
      {!day.isRestDay && <WorkoutTypeSelect dayIndex={activeDay} day={day} />}
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
          items={day.exercises.map((ex) => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.exercises.map((exercise, index) => (
            <div key={exercise.id}>
              <div className="mb-2">
                <SortableExercise
                  exercise={exercise}
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
export function DroppableDay({ day }: DroppableDayProps) {
  const { updateDay, activeWeek } = useTrainingPlan()
  const { containerRef, draggedOverIndex } = useDragDropLogic(day)

  const { setNodeRef } = useDroppable({
    id: day.id,
    disabled: day.isRestDay,
    data: {
      type: 'day',
      day: day,
    },
  })

  const handleToggleRestDay = useCallback(() => {
    updateDay(activeWeek, day.dayOfWeek, {
      ...day,
      isRestDay: !day.isRestDay,
    })
  }, [updateDay, activeWeek, day])

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        containerRef.current = node
      }}
      className="w-[260px] bg-neutral-950/30 px-4 py-2 rounded-lg min-h-[400px]"
    >
      <DayHeader day={day} onToggleRestDay={handleToggleRestDay} />

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
