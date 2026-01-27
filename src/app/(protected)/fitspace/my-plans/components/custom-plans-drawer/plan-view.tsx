'use client'

import { ChevronRight, FolderInput, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { MoveToFolderDrawer } from '../favourites/move-to-folder-drawer'

import type { FavouriteWorkout, FavouriteWorkoutFolder } from './types'

interface PlanViewProps {
  days: FavouriteWorkout[]
  folders: FavouriteWorkoutFolder[]
  isLoading: boolean
  isCreatingDay?: boolean
  canCreateDay?: boolean
  canDeletePlan?: boolean
  isDeletingPlan?: boolean
  onSelectDay: (favouriteId: string) => void
  onCreateDay: () => void
  onDeletePlan?: () => void
  onRefetch: () => void
  onMoveSuccess: () => void
}

export function PlanView({
  days,
  folders,
  isLoading,
  isCreatingDay = false,
  canCreateDay = true,
  canDeletePlan = false,
  isDeletingPlan = false,
  onSelectDay,
  onCreateDay,
  onDeletePlan,
  onRefetch,
  onMoveSuccess,
}: PlanViewProps) {
  const disableCreate = isLoading || isCreatingDay || !canCreateDay
  const canShowDeletePlan = canDeletePlan && !!onDeletePlan
  const [moveDayId, setMoveDayId] = useState<string | null>(null)

  const moveDay = useMemo(() => {
    if (!moveDayId) return null
    return days.find((d) => d.id === moveDayId) ?? null
  }, [days, moveDayId])

  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Workout Sessions
        </p>
        <div className="flex items-center gap-2">
          {canShowDeletePlan ? (
            <Button
              variant="destructive"
              size="icon-md"
              iconOnly={<Trash2 />}
              aria-label="Delete plan"
              onClick={onDeletePlan}
              disabled={isDeletingPlan}
              loading={isDeletingPlan}
            />
          ) : null}
          <Button
            iconStart={<Plus />}
            onClick={onCreateDay}
            disabled={disableCreate}
            loading={isCreatingDay}
          >
            Add session
          </Button>
        </div>
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
              loading={isCreatingDay}
            >
              Create session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {days.map((day) => (
            <div
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDay(day.id)
                }
              }}
              role="button"
              tabIndex={0}
              className={cn(
                'w-full text-left rounded-xl border border-border bg-card/50 hover:bg-accent/50 transition-colors',
                'px-4 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-3',
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
              <Button
                variant="secondary"
                size="icon-md"
                iconOnly={<FolderInput />}
                aria-label="Move session to plan"
                onClick={(e) => {
                  e.stopPropagation()
                  setMoveDayId(day.id)
                }}
              />
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
      </div>

      {moveDay ? (
        <MoveToFolderDrawer
          open={!!moveDay}
          onClose={() => setMoveDayId(null)}
          favouriteId={moveDay.id}
          currentFolderId={moveDay.folderId}
          folders={folders}
          onSuccess={() => {
            onMoveSuccess()
            onRefetch()
          }}
        />
      ) : null}
    </>
  )
}
