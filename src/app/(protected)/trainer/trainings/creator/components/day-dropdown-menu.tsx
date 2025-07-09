import { BicepsFlexedIcon, MoreVertical, ReplaceAllIcon } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { GQLWorkoutType } from '@/generated/graphql-client'

import { dayNames, workoutTypeGroups } from '../utils'

interface MoveExercisesDropdownProps {
  sourceDayId: string
  sourceWeekIndex: number
  sourceDayIndex: number
  disabled?: boolean
}

export function DayDropdownMenu({
  sourceDayId,
  sourceWeekIndex,
  sourceDayIndex,
  disabled = false,
}: MoveExercisesDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className="gap-1"
          iconOnly={<MoreVertical />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <WorkoutTypeDropdown
          sourceWeekIndex={sourceWeekIndex}
          sourceDayIndex={sourceDayIndex}
        />
        <MoveDropdownItem
          sourceDayId={sourceDayId}
          sourceWeekIndex={sourceWeekIndex}
          sourceDayIndex={sourceDayIndex}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WorkoutTypeDropdown({
  sourceWeekIndex,
  sourceDayIndex,
}: {
  sourceWeekIndex: number
  sourceDayIndex: number
}) {
  const { formData, updateDay, activeWeek } = useTrainingPlan()
  const day = formData?.weeks[activeWeek]?.days[sourceDayIndex]

  const [workoutType, setWorkoutType] = useState(day?.workoutType)

  useEffect(() => {
    if (day) {
      setWorkoutType(day.workoutType)
    }
  }, [day])

  const handleSelectWorkoutType = useCallback(
    (value: GQLWorkoutType) => {
      setWorkoutType(value)
      updateDay(sourceWeekIndex, sourceDayIndex, {
        workoutType: value,
      })
    },
    [sourceWeekIndex, sourceDayIndex, updateDay],
  )

  if (day?.isRestDay) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        <BicepsFlexedIcon className="size-4" />
        Select Day Type
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {workoutTypeGroups.map((group) => (
            <React.Fragment key={group.label}>
              <DropdownMenuLabel className="text-md font-medium pt-4">
                {group.label}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {group.types.map((type) => (
                <DropdownMenuItem
                  key={type}
                  disabled={workoutType === type}
                  onClick={() => handleSelectWorkoutType(type)}
                  className="flex justify-between items-center"
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function MoveDropdownItem({
  sourceDayId,
  sourceWeekIndex,
  sourceDayIndex,
}: {
  sourceDayId: string
  sourceWeekIndex: number
  sourceDayIndex: number
}) {
  const { formData, moveExercisesToDay } = useTrainingPlan()

  if (!formData || !formData.weeks || formData.weeks.length === 0) {
    return null
  }

  // Check if source day has exercises to move
  const sourceDay = formData.weeks[sourceWeekIndex]?.days[sourceDayIndex]
  const hasExercisesToMove =
    sourceDay?.exercises && sourceDay.exercises.length > 0

  if (!hasExercisesToMove) {
    return null
  }

  return formData.weeks.map((week, weekIndex) => (
    <DropdownMenuSub key={week.id}>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        <ReplaceAllIcon className="size-4" />
        Move Exercises
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {week.days.map((day, dayIndex) => {
            const isSourceDay =
              weekIndex === sourceWeekIndex && dayIndex === sourceDayIndex
            const isCompletedDay = Boolean(day.completedAt)
            const dayName = dayNames[day.dayOfWeek]
            const exerciseCount = day.exercises?.length || 0

            return (
              <DropdownMenuItem
                key={day.id}
                disabled={isSourceDay || isCompletedDay || exerciseCount > 0}
                onClick={() => moveExercisesToDay(sourceDayId, day.id)}
                className="flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{dayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {day.isRestDay ? 'Rest day' : `${exerciseCount} exercises`}
                  </span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  ))
}
