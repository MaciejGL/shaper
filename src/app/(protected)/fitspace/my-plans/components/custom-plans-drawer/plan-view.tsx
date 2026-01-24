'use client'

import { ChevronRight, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { FavouriteWorkout } from './types'

interface PlanViewProps {
  days: FavouriteWorkout[]
  isLoading: boolean
  canCreateDay?: boolean
  onSelectDay: (favouriteId: string) => void
  onCreateDay: () => void
}

export function PlanView({
  days,
  isLoading,
  canCreateDay = true,
  onSelectDay,
  onCreateDay,
}: PlanViewProps) {
  const disableCreate = isLoading || !canCreateDay

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Workout Sessions
        </p>
        <Button
          iconStart={<Plus />}
          onClick={onCreateDay}
          disabled={disableCreate}
        >
          Add session
        </Button>
      </div>

      {days.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center space-y-3 flex-center flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              No sessions yet. Create your first session to start building this
              plan.
            </p>
            <Button
              iconStart={<Plus />}
              onClick={onCreateDay}
              disabled={disableCreate}
            >
              Create session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={cn(
                'w-full text-left rounded-xl border border-border bg-card/50 hover:bg-accent/50 transition-colors',
                'px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3',
              )}
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{day.title}</p>
                {day.exercises.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {day.exercises.length} exercises
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Empty day</p>
                )}
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
