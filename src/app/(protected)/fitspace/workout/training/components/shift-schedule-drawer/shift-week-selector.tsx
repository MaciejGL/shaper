'use client'

import { format } from 'date-fns'

import { cn } from '@/lib/utils'

import type { NavigationPlan, NavigationWeek } from '../workout-day'

interface ShiftWeekSelectorProps {
  plan: NavigationPlan
  selectedWeekId: string | null
  onSelectWeek: (weekId: string) => void
}

export function ShiftWeekSelector({
  plan,
  selectedWeekId,
  onSelectWeek,
}: ShiftWeekSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 pb-1">
      {plan.weeks.map((week) => {
        const isSelected = selectedWeekId === week.id
        const isCompleted = isWeekFullyCompleted(week)
        const status = getWeekStatus(week)

        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onSelectWeek(week.id)}
            disabled={isCompleted}
            data-selected={isSelected}
            className={cn(
              'flex flex-col items-center justify-center shrink-0 p-3 rounded-xl border transition-all min-w-[72px] aspect-square',
              'bg-card dark:bg-card-on-card hover:bg-secondary/50',
              isCompleted && 'opacity-40 cursor-not-allowed',
              'data-[selected=true]:border-primary data-[selected=true]:bg-primary/10',
            )}
          >
            <span className="text-xs text-muted-foreground">Week</span>
            <span className="text-lg font-semibold">{week.weekNumber}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {formatWeekStart(week)}
            </span>
            {status !== 'upcoming' && (
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1',
                  status === 'completed' && 'bg-green-500',
                  status === 'in-progress' && 'bg-amber-500',
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function isWeekFullyCompleted(week: NavigationWeek): boolean {
  const workoutDays = week.days.filter((day) => !day.isRestDay)
  if (workoutDays.length === 0) return false
  return workoutDays.every((day) => day.completedAt)
}

function getWeekStatus(
  week: NavigationWeek,
): 'completed' | 'in-progress' | 'upcoming' {
  const workoutDays = week.days.filter((day) => !day.isRestDay)
  if (workoutDays.length === 0) return 'upcoming'

  const completedCount = workoutDays.filter((day) => day.completedAt).length
  if (completedCount === workoutDays.length) return 'completed'
  if (completedCount > 0) return 'in-progress'
  return 'upcoming'
}

function formatWeekStart(week: NavigationWeek): string {
  if (!week.scheduledAt) return '-'
  return format(new Date(week.scheduledAt), 'MMM d')
}
