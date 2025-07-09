import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { dayNames } from '../utils'

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
        <MoveDropdownItem
          sourceDayId={sourceDayId}
          sourceWeekIndex={sourceWeekIndex}
          sourceDayIndex={sourceDayIndex}
        />
      </DropdownMenuContent>
    </DropdownMenu>
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
      <DropdownMenuSubTrigger>Move Exercises</DropdownMenuSubTrigger>
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
                disabled={isSourceDay || isCompletedDay}
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
