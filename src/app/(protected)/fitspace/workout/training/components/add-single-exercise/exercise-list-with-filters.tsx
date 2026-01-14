'use client'

import { SearchIcon } from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Input } from '@/components/ui/input'
import {
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import { cn } from '@/lib/utils'

import { SelectableExerciseItem } from './selectable-exercise-item'
import type { ExerciseListExercise } from './types'
import type { WeeklyGroupSummary } from './types'
import { getExerciseMuscleDisplay } from './utils'
import { WeeklyFocusChips } from './weekly-focus-chips'

type MuscleFilterMode = 'none' | 'simple' | 'weeklyFocus'

interface ExerciseListWithFiltersProps {
  exercises: ExerciseListExercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (id: string) => void
  isLoading: boolean

  title?: string | false
  subtitle?: string
  tagLabel?: string

  suggestions?: React.ReactNode

  muscleFilterMode?: MuscleFilterMode
  weeklyFocus?: {
    groupSummaries: WeeklyGroupSummary[]
    isLoading?: boolean
  }
  showWeeklyFocusVolume?: boolean

  renderItem?: (
    exercise: ExerciseListExercise,
    isSelected: boolean,
  ) => React.ReactNode
}

export function ExerciseListWithFilters({
  exercises,
  selectedExerciseIds,
  onToggleExercise,
  isLoading,
  title = 'Build your workout',
  subtitle = "Pick exercises for today's session.",
  tagLabel,
  suggestions,
  muscleFilterMode = 'weeklyFocus',
  weeklyFocus,
  showWeeklyFocusVolume = true,
  renderItem,
}: ExerciseListWithFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const selectedExerciseIdSet = useMemo(
    () => new Set(selectedExerciseIds),
    [selectedExerciseIds],
  )
  const [selectedGroup, setSelectedGroup] = useState<HighLevelGroup | null>(
    null,
  )
  const [scrollParent, setScrollParent] = useState<HTMLDivElement | null>(null)
  const setScrollParentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollParent(el)
  }, [])

  const filteredExercises = useMemo(() => {
    let result = exercises

    if (selectedGroup) {
      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[selectedGroup]
      result = result.filter((exercise) =>
        exercise.muscleGroups?.some((mg) =>
          displayGroups.includes(mg.displayGroup),
        ),
      )
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      result = result.filter((exercise) => {
        const nameMatch = exercise.name.toLowerCase().includes(query)
        const muscleGroupMatch = exercise.muscleGroups?.some((mg) =>
          mg.alias?.toLowerCase().includes(query),
        )
        return nameMatch || muscleGroupMatch
      })
    }

    return result
  }, [exercises, selectedGroup, deferredSearchQuery])

  const defaultRenderItem = useCallback(
    (exercise: ExerciseListExercise, isSelected: boolean) => {
      const muscleDisplay = getExerciseMuscleDisplay(exercise)
      return (
        <SelectableExerciseItem
          id={exercise.id}
          name={exercise.name}
          muscleDisplay={muscleDisplay}
          images={
            exercise.images as ({ medium?: string | null } | null)[] | null
          }
          videoUrl={exercise.videoUrl}
          isSelected={isSelected}
          onToggle={onToggleExercise}
          detailExercise={exercise}
        />
      )
    },
    [onToggleExercise],
  )

  const itemRenderer = renderItem ?? defaultRenderItem

  const headerContent = (
    <div className="px-4 pb-4 pt-2">
      {title !== false && (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              {tagLabel ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {tagLabel}
                </span>
              ) : null}
            </div>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      )}

      {suggestions ? <div className="my-6">{suggestions}</div> : null}

      {muscleFilterMode === 'weeklyFocus' && weeklyFocus ? (
        <div className="mt-6">
          <WeeklyFocusChips
            groupSummaries={weeklyFocus.groupSummaries}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            isLoading={weeklyFocus.isLoading}
            showVolume={showWeeklyFocusVolume}
          />
        </div>
      ) : null}

      {muscleFilterMode === 'simple' ? (
        <div className="mt-6">
          <SimpleMuscleFilterChips
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />
        </div>
      ) : null}

      <div
        className={cn(
          suggestions || muscleFilterMode !== 'none' ? 'pt-6' : 'pt-2',
        )}
      >
        <Input
          id="search-exercises"
          placeholder="Search exercises name or muscle group..."
          value={searchQuery}
          variant="secondary"
          size="lg"
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
        />
      </div>

      <h3 className="text-sm font-medium text-muted-foreground pt-4">
        {selectedGroup ? `${selectedGroup} exercises` : 'All exercises'}{' '}
        {!isLoading && `(${filteredExercises.length})`}
      </h3>
    </div>
  )

  return (
    <div className="flex-1 min-h-0">
      <div ref={setScrollParentRef} className="h-full overflow-y-auto">
        {headerContent}

        {isLoading ? (
          <div className="px-4 pb-4 space-y-2">
            <LoadingSkeleton count={8} />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="px-4 pb-4">
            <div className="text-center py-8 space-y-1">
              <p className="text-muted-foreground">
                No exercises match this filter.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Try a different muscle group or clear filters.
              </p>
            </div>
          </div>
        ) : scrollParent ? (
          <Virtuoso
            data={filteredExercises}
            customScrollParent={scrollParent}
            computeItemKey={(_index, exercise) => exercise.id}
            itemContent={(_index, exercise) => {
              const isSelected = selectedExerciseIdSet.has(exercise.id)
              return (
                <div className="px-4 pb-2">
                  {itemRenderer(exercise, isSelected)}
                </div>
              )
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

interface SimpleMuscleFilterChipsProps {
  selectedGroup: HighLevelGroup | null
  onSelectGroup: (group: HighLevelGroup | null) => void
}

function SimpleMuscleFilterChips({
  selectedGroup,
  onSelectGroup,
}: SimpleMuscleFilterChipsProps) {
  const options = Object.keys(HIGH_LEVEL_TO_DISPLAY_GROUPS) as HighLevelGroup[]

  return (
    <div className="-mx-4 pl-4 pr-12 overflow-x-auto hide-scrollbar bg-muted/50 shadow-xs">
      <div className="flex gap-2 py-1.5 min-w-max">
        <button
          type="button"
          onClick={() => onSelectGroup(null)}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            'border whitespace-nowrap',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            selectedGroup === null
              ? 'border-primary text-foreground'
              : 'border-border bg-card hover:bg-muted/50 text-foreground',
          )}
        >
          All
        </button>
        {options.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onSelectGroup(group)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border whitespace-nowrap',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selectedGroup === group
                ? 'border-primary text-foreground'
                : 'border-border bg-card hover:bg-muted/50 text-foreground',
            )}
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  )
}
