import {
  ArrowRight,
  BadgeCheckIcon,
  ChevronDown,
  ListChecksIcon,
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkout } from '@/context/workout-context/workout-context'
import { cn } from '@/lib/utils'

import { ExerciseSelectorProps } from './types'

export function ExerciseSelector({
  exercise,
  activeExerciseId,
  setActiveExerciseId,
  className,
}: ExerciseSelectorProps) {
  const { activeDay } = useWorkout()

  const activeDayWithoutSubstitutes = activeDay?.exercises.filter(
    (e) =>
      activeDay?.exercises.findIndex((e2) => e2.substitutedBy?.id === e.id) ===
      -1,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/dropdown" asChild>
        <Button
          variant="secondary"
          className={cn('grow justify-between bg-secondary', className)}
          iconEnd={
            <ChevronDown
              className={cn(
                'text-muted-foreground size-4 group-hover/dropdown:text-primary transition-all duration-200 shrink-0',
              )}
            />
          }
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {activeExerciseId === 'summary' ? (
              <span className="truncate">Summary</span>
            ) : (
              <span className="truncate">
                {exercise?.order}.{' '}
                {exercise?.substitutedBy?.name || exercise?.name}{' '}
              </span>
            )}
            {exercise?.completedAt ? (
              <BadgeCheckIcon className="text-green-500 !size-4" />
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64">
        {activeDayWithoutSubstitutes?.map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <DropdownMenuItem
              key={exercise.id}
              disabled={exercise.id === activeExerciseId}
              onClick={() => setActiveExerciseId(exercise.id)}
            >
              <div className="text-sm grid grid-cols-[auto_1fr_auto] items-center w-full gap-2">
                <ArrowRight
                  className={cn(
                    'text-primary size-4 opacity-0',
                    activeExerciseId === exercise.id && 'opacity-100',
                  )}
                />
                <p>
                  {index + 1}. {exercise.substitutedBy?.name || exercise.name}
                </p>
                {exercise.substitutedBy?.completedAt || exercise.completedAt ? (
                  <BadgeCheckIcon className="self-start ml-auto mt-0.5 text-green-500" />
                ) : null}
              </div>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={activeExerciseId === 'summary'}
          onClick={() => setActiveExerciseId('summary')}
        >
          <div className="text-sm grid grid-cols-[auto_1fr] items-center w-full gap-2">
            <ListChecksIcon className={cn('text-primary size-4')} />
            <p>Summary</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
