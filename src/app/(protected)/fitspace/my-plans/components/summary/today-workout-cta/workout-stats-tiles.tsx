'use client'

import { ChevronRight, Clock, Dumbbell } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { PlanExercise } from './types'
import { WorkoutExercisesDrawer } from './workout-exercises-drawer'

type TileVariant = 'default' | 'premium'

interface WorkoutStatsTilesProps {
  variant: TileVariant
  exercises: PlanExercise[]
  estimatedDuration: number | null
}

function StatTile({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center text-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function WorkoutStatsTiles({
  variant,
  exercises,
  estimatedDuration,
}: WorkoutStatsTilesProps) {
  const tileBg =
    variant === 'premium' ? 'bg-background/50 backdrop-blur-sm' : 'bg-muted/50'

  const clickableTileBg =
    variant === 'premium' ? 'hover:bg-background/80' : 'hover:bg-muted'

  const clickableTileClassName = cn(
    tileBg,
    clickableTileBg,
    'group flex w-full flex-col relative items-center justify-center gap-1 rounded-lg p-2 text-center text-sm transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-full',
  )
  return (
    <div className="grid grid-cols-2 gap-3">
      {estimatedDuration && (
        <StatTile className={tileBg}>
          <Clock className="size-4 text-muted-foreground" />
          <span className="font-medium">{estimatedDuration} min</span>
        </StatTile>
      )}

      <WorkoutExercisesDrawer
        exercises={exercises}
        trigger={
          <Button variant="variantless" className={clickableTileClassName}>
            <Dumbbell className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium flex items-center gap-1">
              {exercises.length} Exercises
            </span>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2" />
          </Button>
        }
      />
    </div>
  )
}
