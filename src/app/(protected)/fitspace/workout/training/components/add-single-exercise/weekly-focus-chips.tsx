'use client'

import { Progress } from '@/components/ui/progress'
import type { HighLevelGroup } from '@/config/muscles'
import { cn } from '@/lib/utils'

import type { WeeklyGroupSummary } from './types'

interface WeeklyFocusChipsProps {
  groupSummaries: WeeklyGroupSummary[]
  selectedGroup: HighLevelGroup | null
  onSelectGroup: (group: HighLevelGroup | null) => void
  isLoading?: boolean
}

export function WeeklyFocusChips({
  groupSummaries,
  selectedGroup,
  onSelectGroup,
  isLoading,
}: WeeklyFocusChipsProps) {
  const hasSelection = selectedGroup !== null

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">Weekly focus</h3>
          <p className="text-xs text-muted-foreground">
            Tap a muscle group to filter exercises. Numbers show sets this week
            / weekly goal.
          </p>
        </div>
        {hasSelection && (
          <button
            type="button"
            onClick={() => onSelectGroup(null)}
            className="shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {groupSummaries.map((summary) => (
          <MiniHeatmapTile
            key={summary.groupId}
            summary={summary}
            isSelected={selectedGroup === summary.groupId}
            onClick={() => onSelectGroup(summary.groupId)}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  )
}

interface MiniHeatmapTileProps {
  summary: WeeklyGroupSummary
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

function MiniHeatmapTile({
  summary,
  isSelected,
  onClick,
  disabled,
}: MiniHeatmapTileProps) {
  const progress =
    summary.setsGoal > 0 ? summary.setsDone / summary.setsGoal : 0
  const progressPercent = Math.min(progress * 100, 100)
  const progressBarColor = getProgressBarColor(summary.setsDone)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg min-h-[60px] text-left transition-all',
        'border shadow-xs',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'border-border bg-card-on-card'
          : 'border-border hover:bg-muted/50',
      )}
    >
      {/* Radio indicator */}
      <div
        className={cn(
          'size-4 shrink-0 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors',
          isSelected ? 'border-primary' : 'border-muted-foreground/40',
        )}
      >
        {isSelected && <div className="size-2 rounded-full bg-primary" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isSelected ? 'text-primary' : 'text-foreground',
            )}
          >
            {summary.label}
          </span>
          <span
            className={cn(
              'text-sm font-medium tabular-nums shrink-0',
              isSelected ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {summary.setsDone}/{summary.setsGoal}
          </span>
        </div>

        <Progress
          value={progressPercent}
          classNameIndicator={progressBarColor}
        />
      </div>
    </button>
  )
}

function getProgressBarColor(setsDone: number): string {
  if (setsDone >= 17) return 'bg-orange-500'
  if (setsDone >= 12) return 'bg-orange-400'
  if (setsDone >= 7) return 'bg-orange-200'
  if (setsDone >= 1) return 'bg-orange-100'
  return 'bg-neutral-500 dark:bg-neutral-700'
}
