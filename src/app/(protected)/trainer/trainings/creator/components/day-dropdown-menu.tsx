import { BicepsFlexedIcon, Copy, MoreVertical, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
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
import { dayNames } from '@/lib/date-utils'

import { workoutTypeGroups } from '../utils'

interface MoveExercisesDropdownProps {
  sourceDayId: string
  sourceWeekIndex: number
  sourceDayIndex: number
  disabled?: boolean
}

export function DayDropdownMenu({
  sourceWeekIndex,
  sourceDayIndex,
  disabled = false,
}: Omit<MoveExercisesDropdownProps, 'sourceDayId'>) {
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
        <CopyDayDropdownItem
          targetWeekIndex={sourceWeekIndex}
          targetDayIndex={sourceDayIndex}
        />
        <RemoveAllExercisesItem sourceDayIndex={sourceDayIndex} />
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

function CopyDayDropdownItem({
  targetWeekIndex,
  targetDayIndex,
}: {
  targetWeekIndex: number
  targetDayIndex: number
}) {
  const { formData, copyExercisesFromDay } = useTrainingPlan()

  if (!formData || !formData.weeks || formData.weeks.length === 0) {
    return null
  }

  const targetDay = formData.weeks[targetWeekIndex]?.days[targetDayIndex]

  const handleCopyExercises = (sourceDayId: string) => {
    if (targetDay?.id) {
      copyExercisesFromDay(sourceDayId, targetDay.id)
    }
  }

  const isDisabled =
    formData.weeks[targetWeekIndex]?.days[targetDayIndex]?.exercises?.length > 0

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className="flex items-center gap-2"
          disabled={isDisabled}
        >
          <Copy className="size-4" />
          Copy Day
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {formData.weeks.map((week, weekIndex) => (
              <WeekSubmenu
                key={week.id}
                week={week}
                weekIndex={weekIndex}
                targetWeekIndex={targetWeekIndex}
                targetDayIndex={targetDayIndex}
                onCopyExercises={handleCopyExercises}
              />
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </>
  )
}

function WeekSubmenu({
  week,
  weekIndex,
  targetWeekIndex,
  targetDayIndex,
  onCopyExercises,
}: {
  week: NonNullable<ReturnType<typeof useTrainingPlan>['formData']>['weeks'][0]
  weekIndex: number
  targetWeekIndex: number
  targetDayIndex: number
  onCopyExercises: (sourceDayId: string) => void
}) {
  // Filter days that have exercises and are not the target day
  const availableDays = week.days.filter((day, dayIndex) => {
    // Exclude rest days
    if (day.isRestDay) return false

    // Exclude days without exercises
    if (!day.exercises || day.exercises.length === 0) return false

    // Exclude the target day (same week and day)
    if (weekIndex === targetWeekIndex && dayIndex === targetDayIndex)
      return false

    return true
  })

  // If no available days, don't show this week
  if (availableDays.length === 0) {
    return null
  }

  const weekDisplayName = week.name || `Week ${week.weekNumber}`

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{weekDisplayName}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Select day to copy from
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableDays.map((day) => {
            const dayName = dayNames[day.dayOfWeek]
            const exerciseCount = day.exercises?.length || 0

            return (
              <DropdownMenuItem
                key={day.id}
                onClick={() => onCopyExercises(day.id)}
                className="flex flex-col items-start gap-1"
              >
                <div className="font-medium">{dayName}</div>
                <div className="text-xs text-muted-foreground">
                  {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  {day.workoutType && ` • ${day.workoutType}`}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function RemoveAllExercisesItem({
  sourceDayIndex,
}: {
  sourceDayIndex: number
}) {
  const { formData, removeAllExercisesFromDay, activeWeek } = useTrainingPlan()
  const { openModal } = useConfirmationModalContext()

  if (!formData || !formData.weeks || formData.weeks.length === 0) {
    return null
  }

  // Check if source day has exercises to remove
  const sourceDay = formData.weeks[activeWeek]?.days[sourceDayIndex]
  const hasExercisesToRemove =
    sourceDay?.exercises && sourceDay.exercises.length > 0

  if (!hasExercisesToRemove) {
    return null
  }

  const exerciseCount = sourceDay?.exercises?.length || 0
  const dayName = dayNames[sourceDay?.dayOfWeek || 0]

  const handleRemoveAllExercises = () => {
    openModal({
      title: 'Remove All Exercises',
      description: `Are you sure you want to remove all ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} from ${dayName}? This action cannot be undone.`,
      confirmText: 'Remove All',
      variant: 'destructive',
      onConfirm: () => {
        removeAllExercisesFromDay(activeWeek, sourceDayIndex)
      },
    })
  }

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleRemoveAllExercises}
        className="flex items-center gap-2 text-destructive focus:text-destructive"
      >
        <Trash2 className="size-4" />
        Remove All Exercises
      </DropdownMenuItem>
    </>
  )
}
