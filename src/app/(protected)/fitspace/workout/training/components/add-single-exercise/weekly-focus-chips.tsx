'use client'

import type { HighLevelGroup } from '@/config/muscles'
import { cn } from '@/lib/utils'

import type { WeeklyGroupSummary } from './types'

interface WeeklyFocusChipsProps {
  groupSummaries: WeeklyGroupSummary[]
  selectedGroup: HighLevelGroup | null
  onSelectGroup: (group: HighLevelGroup | null) => void
  isLoading?: boolean
  showVolume?: boolean
}

export function WeeklyFocusChips({
  groupSummaries,
  selectedGroup,
  onSelectGroup,
  isLoading,
  showVolume = true,
}: WeeklyFocusChipsProps) {
  const selectedSummary = groupSummaries.find(
    (s) => s.groupId === selectedGroup,
  )

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground transition-all h-4">
        {selectedSummary ? (
          showVolume ? (
            <>
              <span className="font-medium text-foreground">
                {selectedSummary.label}
              </span>{' '}
              · {selectedSummary.setsDone} / {selectedSummary.setsGoal} sets
              this week
            </>
          ) : (
            <span className="font-medium text-foreground">
              {selectedSummary.label}
            </span>
          )
        ) : showVolume ? (
          'Weekly focus · Tap a muscle to filter'
        ) : (
          'Tap a muscle to filter'
        )}
      </p>

      <div className="-mx-4 pl-4 pr-12 overflow-x-auto hide-scrollbar bg-muted shadow-xs">
        <div className="flex gap-2 py-1.5 min-w-max">
          <FilterChip
            label="All"
            isSelected={selectedGroup === null}
            onClick={() => onSelectGroup(null)}
            disabled={isLoading}
          />
          {groupSummaries.map((summary) => (
            <MuscleChip
              key={summary.groupId}
              summary={summary}
              isSelected={selectedGroup === summary.groupId}
              onClick={() => onSelectGroup(summary.groupId)}
              disabled={isLoading}
              showVolume={showVolume}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FilterChipProps {
  label: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

function FilterChip({ label, isSelected, onClick, disabled }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        'border whitespace-nowrap',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary text-foreground'
          : 'border-border bg-card hover:bg-muted/50 text-foreground',
      )}
    >
      {label}
    </button>
  )
}

interface MuscleChipProps {
  summary: WeeklyGroupSummary
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  showVolume: boolean
}

function MuscleChip({
  summary,
  isSelected,
  onClick,
  disabled,
  showVolume,
}: MuscleChipProps) {
  const progress =
    showVolume && summary.setsGoal > 0 ? summary.setsDone / summary.setsGoal : 0
  const progressPercent = Math.min(progress * 100, 100)
  const progressClassName = getProgressColorClass(progressPercent)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all text-foreground',
        'outline whitespace-nowrap',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'outline-primary'
          : 'outline-border bg-card hover:bg-muted/50 text-foreground',
      )}
    >
      {showVolume ? (
        <ProgressRing
          progress={progressPercent}
          className={progressClassName}
          size={14}
        />
      ) : null}
      <span>{summary.label}</span>
    </button>
  )
}

interface ProgressRingProps {
  progress: number
  className: string
  size?: number
}

function ProgressRing({ progress, className, size = 14 }: ProgressRingProps) {
  const strokeWidth = 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted-foreground/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className={cn('transition-all duration-300', className)}
      />
    </svg>
  )
}

function getProgressColorClass(progressPercent: number): string {
  if (progressPercent >= 100) return 'text-primary'
  if (progressPercent >= 75) return 'text-primary/85'
  if (progressPercent >= 50) return 'text-primary/70'
  if (progressPercent > 0) return 'text-primary/55'
  return 'text-muted-foreground/50'
}
