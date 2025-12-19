'use client'

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
  const selectedSummary = groupSummaries.find(
    (s) => s.groupId === selectedGroup,
  )

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground transition-all h-4">
        {selectedSummary ? (
          <>
            <span className="font-medium text-foreground">
              {selectedSummary.label}
            </span>{' '}
            · {selectedSummary.setsDone} / {selectedSummary.setsGoal} sets this
            week
          </>
        ) : (
          'Weekly focus · Tap a muscle to filter'
        )}
      </p>

      <div className="-mx-4 px-4 overflow-x-auto hide-scrollbar bg-muted/50 shadow-xs">
        <div className="flex gap-2 py-1.5">
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
          ? 'border-primary bg-primary text-primary-foreground'
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
}

function MuscleChip({
  summary,
  isSelected,
  onClick,
  disabled,
}: MuscleChipProps) {
  const progress =
    summary.setsGoal > 0 ? summary.setsDone / summary.setsGoal : 0
  const progressPercent = Math.min(progress * 100, 100)
  const progressColor = getProgressColor(progressPercent)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all',
        'outline whitespace-nowrap',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isSelected
          ? 'outline-primary bg-card'
          : 'outline-border bg-card hover:bg-muted/50 text-foreground',
      )}
    >
      <ProgressRing
        progress={progressPercent}
        color={progressColor}
        size={14}
      />
      <span>{summary.label}</span>
    </button>
  )
}

interface ProgressRingProps {
  progress: number
  color: string
  size?: number
}

function ProgressRing({ progress, color, size = 14 }: ProgressRingProps) {
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
        className="opacity-20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    </svg>
  )
}

function getProgressColor(progressPercent: number): string {
  if (progressPercent >= 100) return 'rgb(34, 197, 94)' // green-500 - completed
  if (progressPercent >= 75) return 'rgb(249, 115, 22)' // orange-500
  if (progressPercent >= 50) return 'rgb(251, 146, 60)' // orange-400
  if (progressPercent > 0) return 'rgb(253, 186, 116)' // orange-300
  return 'rgb(163, 163, 163)' // neutral-400
}
