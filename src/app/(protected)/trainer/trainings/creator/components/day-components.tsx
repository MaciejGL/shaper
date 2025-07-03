import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLWorkoutType } from '@/generated/graphql-client'

import { TrainingDay } from '../../../types'
import { dayNames } from '../utils'

import { InsertionIndicator } from './insertion-indicators'
import { SortableExercise } from './sortable-exercise'
import { WorkoutTypeSelect } from './workout-type-select'

// Memoized day header to prevent unnecessary rerenders
export const DayHeader = React.memo(({ dayIndex }: { dayIndex: number }) => {
  const { formData, updateDay, activeWeek } = useTrainingPlan()
  const day = formData?.weeks[activeWeek]?.days[dayIndex]

  const [isRestDay, setIsRestDay] = useState(day?.isRestDay ?? false)
  const [workoutType, setWorkoutType] = useState(day?.workoutType)

  useEffect(() => {
    if (day) {
      setIsRestDay(day.isRestDay)
      setWorkoutType(day.workoutType)
    }
  }, [day])

  const handleRestDayChange = useCallback(
    (bool: boolean) => {
      setIsRestDay(bool)
      // Only pass the allowed fields for the mutation
      updateDay(activeWeek, dayIndex, {
        isRestDay: bool,
      })
    },
    [activeWeek, dayIndex, updateDay],
  )

  const handleValueChange = useCallback(
    (value: GQLWorkoutType) => {
      setWorkoutType(value)
      // Only pass the allowed fields for the mutation
      updateDay(activeWeek, dayIndex, {
        workoutType: value,
      })
    },
    [activeWeek, dayIndex, updateDay],
  )

  return (
    <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={!isRestDay}
          onCheckedChange={(value) => handleRestDayChange(!value)}
        />
        <span className="font-medium text-sm py-3">
          {dayNames[day?.dayOfWeek ?? 0]}
        </span>
      </div>
      <AnimatePresence>
        {!isRestDay && (
          <motion.div
            key={day?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <WorkoutTypeSelect
              dayIndex={dayIndex}
              workoutType={workoutType}
              onValueChange={handleValueChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
DayHeader.displayName = 'DayHeader'

// Memoized exercise list to prevent unnecessary rerenders when not dragging
export const ExerciseList = React.memo(
  ({
    day,
    draggedOverIndex,
  }: {
    day: TrainingDay
    draggedOverIndex: number | null
  }) => {
    const { activeWeek } = useTrainingPlan()

    // Memoize stable keys more efficiently
    const exerciseKeys = useMemo(
      () =>
        day.exercises?.map(
          (_, index) => `${activeWeek}-${day.dayOfWeek}-${index}`,
        ) || [],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [day.exercises?.length, activeWeek, day.dayOfWeek], // Only depend on length, not full array
    )

    return (
      <div className="flex-1 max-w-full">
        {/* Sidebar insertion indicator at the start of the list */}
        <InsertionIndicator isActive={draggedOverIndex === 0} />

        <div className="min-h-[120px] py-2 rounded">
          <SortableContext
            items={exerciseKeys}
            strategy={verticalListSortingStrategy}
          >
            {day.exercises?.map((exercise, index) => (
              <div
                key={exerciseKeys[index]} // Use stable key for React key
                className="mb-2 w-full"
              >
                <SortableExercise
                  exerciseId={exercise.id}
                  dayOfWeek={day.dayOfWeek}
                  exerciseIndex={index}
                />
                {/* Sidebar insertion indicator at the end of the list */}
                <InsertionIndicator isActive={draggedOverIndex === index + 1} />
              </div>
            ))}
          </SortableContext>
        </div>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // More specific comparison
    return (
      prevProps.day.dayOfWeek === nextProps.day.dayOfWeek &&
      prevProps.day.exercises?.length === nextProps.day.exercises?.length &&
      prevProps.draggedOverIndex === nextProps.draggedOverIndex
    )
  },
)
ExerciseList.displayName = 'ExerciseList'

// Memoized rest day content
export const RestDayContent = React.memo(() => {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium">
      Rest day
    </div>
  )
})
RestDayContent.displayName = 'RestDayContent'
