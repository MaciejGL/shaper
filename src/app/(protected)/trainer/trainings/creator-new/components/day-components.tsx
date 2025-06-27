import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLWorkoutType } from '@/generated/graphql-client'

import { WorkoutTypeSelect } from '../../creator/components/days-setup/workout-type-select'
import { TrainingDay } from '../../creator/components/types'
import { dayNames } from '../../creator/components/utils'

import { InsertionIndicator } from './insertion-indicators'
import { SortableExercise } from './sortable-exercise'

// Memoized day header to prevent unnecessary rerenders
export const DayHeader = React.memo(({ dayIndex }: { dayIndex: number }) => {
  const { formData, updateDay, activeWeek } = useTrainingPlan()
  const day = formData.weeks[activeWeek]?.days[dayIndex]
  const [isRestDay, setIsRestDay] = useState(day.isRestDay)
  const [workoutType, setWorkoutType] = useState(day.workoutType)

  useEffect(() => {
    setIsRestDay(day.isRestDay)
    setWorkoutType(day.workoutType)
  }, [day])

  const handleRestDayChange = useCallback(
    (bool: boolean) => {
      setIsRestDay(bool)
      updateDay(activeWeek, dayIndex, {
        ...day,
        isRestDay: bool,
      })
    },
    [activeWeek, day, dayIndex, updateDay],
  )

  const handleValueChange = useCallback(
    (value: GQLWorkoutType) => {
      updateDay(activeWeek, dayIndex, {
        ...day,
        workoutType: value,
      })
    },
    [activeWeek, day, dayIndex, updateDay],
  )

  return (
    <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={!isRestDay}
          onCheckedChange={(value) => handleRestDayChange(!value)}
        />
        <span className="font-medium text-sm py-3">
          {dayNames[day.dayOfWeek]}
        </span>
      </div>
      <AnimatePresence>
        {!isRestDay && (
          <motion.div
            key={day.id}
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
    // Memoize exercise IDs to prevent SortableContext recreation
    const exerciseIds = useMemo(
      () => day.exercises?.map((ex) => ex.id) || [],
      [day.exercises],
    )

    return (
      <div className="flex-1 max-w-full">
        <InsertionIndicator isActive={draggedOverIndex === 0} />

        <div className="min-h-[120px] py-2 rounded">
          <SortableContext
            items={exerciseIds}
            strategy={verticalListSortingStrategy}
          >
            {day.exercises?.map((exercise, index) => (
              <div key={exercise.id}>
                <div className="mb-2 w-full ">
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
