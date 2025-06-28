'use client'

import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import React from 'react'

import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { useDragDropLogic } from '../hooks/use-drag-drop-logic'

import { DayHeader, ExerciseList, RestDayContent } from './day-components'

interface DroppableDayProps {
  dayIndex: number
}

// Main component - memoized to prevent rerenders when day data hasn't changed
export const DroppableDay = React.memo(({ dayIndex }: DroppableDayProps) => {
  const { formData, activeWeek } = useTrainingPlan()
  const day = formData.weeks[activeWeek]?.days[dayIndex]

  const { containerRef, draggedOverIndex } = useDragDropLogic(day)

  const { setNodeRef } = useDroppable({
    id: day.id,
    disabled: day.isRestDay,
    data: {
      type: 'day',
      day: day,
    },
  })

  if (!day) return null

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node)
        containerRef.current = node
      }}
      key={day.id}
      animate={{
        width: day.isRestDay ? 160 : 324,
      }}
      initial={{
        width: day.isRestDay ? 160 : 324,
      }}
      transition={{
        duration: 0.15,
      }}
      className={cn(
        'bg-neutral-50 dark:bg-neutral-950/30 px-3 py-2 rounded-lg grow',
      )}
    >
      <DayHeader dayIndex={dayIndex} />
      <div className={cn('flex grow', day.isRestDay && 'opacity-50')}>
        {day.isRestDay ? (
          <RestDayContent />
        ) : (
          <ExerciseList day={day} draggedOverIndex={draggedOverIndex} />
        )}
      </div>
    </motion.div>
  )
})

DroppableDay.displayName = 'DroppableDay'
