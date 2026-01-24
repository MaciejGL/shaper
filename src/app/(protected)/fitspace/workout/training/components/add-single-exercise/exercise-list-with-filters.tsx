'use client'

import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DrawerGoBackButton } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import { useUser } from '@/context/user-context'
import type { GQLEquipment } from '@/generated/graphql-client'
import { ExerciseSearchEngine } from '@/lib/exercise-search'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

import { CustomExerciseDialog } from '../custom-exercise-dialog/custom-exercise-dialog'
import type { MuscleGroupCategories } from '../custom-exercise-dialog/types'
import { useCustomExerciseMutations } from '../custom-exercise-dialog/use-custom-exercise-mutations'

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
  categories?: MuscleGroupCategories

  title?: string | false
  subtitle?: string | false
  tagLabel?: string

  suggestionsTrigger?: React.ReactNode
  suggestionsPanel?: React.ReactNode

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
  categories,
  title = 'Build your workout',
  subtitle = "Pick exercises for today's session.",
  tagLabel,
  suggestionsTrigger,
  suggestionsPanel,
  muscleFilterMode = 'weeklyFocus',
  weeklyFocus,
  showWeeklyFocusVolume = true,
  renderItem,
}: ExerciseListWithFiltersProps) {
  const { hasPremium, user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const selectedExerciseIdSet = useMemo(
    () => new Set(selectedExerciseIds),
    [selectedExerciseIds],
  )
  const [onlyMyExercises, setOnlyMyExercises] = useState(false)
  const [selectedEquipment, setSelectedEquipment] =
    useState<GQLEquipment | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<HighLevelGroup | null>(
    null,
  )
  const [scrollParent, setScrollParent] = useState<HTMLDivElement | null>(null)
  const setScrollParentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollParent(el)
  }, [])

  const availableEquipment = useMemo(() => {
    const present = new Set<GQLEquipment>()
    exercises.forEach((exercise) => {
      if (exercise.equipment) present.add(exercise.equipment)
    })
    return Array.from(present).sort((a, b) =>
      translateEquipment(a).localeCompare(translateEquipment(b)),
    )
  }, [exercises])

  const searchEngine = useMemo(
    () => new ExerciseSearchEngine(exercises),
    [exercises],
  )

  const filteredExercises = useMemo(() => {
    let result = exercises

    if (onlyMyExercises && user?.id) {
      result = result.filter((exercise) => exercise.createdById === user.id)
    }

    if (selectedEquipment) {
      result = result.filter(
        (exercise) => exercise.equipment === selectedEquipment,
      )
    }

    if (selectedGroup) {
      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[selectedGroup]
      result = result.filter((exercise) =>
        exercise.muscleGroups?.some((mg) =>
          displayGroups.includes(mg.displayGroup),
        ),
      )
    }

    if (deferredSearchQuery.trim()) {
      const searchResults = searchEngine.search(deferredSearchQuery.trim())
      const searchResultIds = new Set(searchResults.map((e) => e.id))
      result = result.filter((e) => searchResultIds.has(e.id))
    }

    return result
  }, [
    exercises,
    selectedGroup,
    deferredSearchQuery,
    onlyMyExercises,
    user,
    selectedEquipment,
    searchEngine,
  ])

  const [customExerciseDialogOpen, setCustomExerciseDialogOpen] =
    useState(false)
  const [editingExercise, setEditingExercise] =
    useState<ExerciseListExercise | null>(null)
  const [deleteExercise, setDeleteExercise] =
    useState<ExerciseListExercise | null>(null)

  const defaultRenderItem = useCallback(
    (exercise: ExerciseListExercise, isSelected: boolean) => {
      const muscleDisplay = getExerciseMuscleDisplay(exercise)
      const equipmentDisplay = exercise.equipment
        ? translateEquipment(exercise.equipment)
        : undefined
      return (
        <SelectableExerciseItem
          id={exercise.id}
          name={exercise.name}
          muscleDisplay={muscleDisplay}
          equipmentDisplay={equipmentDisplay}
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

  const { remove: removeCustomExercise, isDeleting } =
    useCustomExerciseMutations({
      categories,
      userId: user?.id,
    })

  const headerContent = (
    <div className="pb-3 overflow-x-hidden">
      <div className="dark p-3 bg-sidebar dark:bg-card">
        <p className="text-lg font-semibold text-foreground">Filters</p>
        {muscleFilterMode === 'weeklyFocus' && weeklyFocus ? (
          <div className="mt-3">
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
          <div className="mt-3">
            <p className="text-xs text-muted-foreground transition-all h-4">
              Muscle group
            </p>
            <div className="mt-2">
              <SimpleMuscleFilterChips
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
              />
            </div>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground transition-all h-4 mt-3">
          Equipment
        </p>
        {availableEquipment.length > 1 ? (
          <div className="mt-2">
            <EquipmentFilterChips
              equipment={availableEquipment}
              selectedEquipment={selectedEquipment}
              onSelectEquipment={setSelectedEquipment}
            />
          </div>
        ) : null}

        <div className="mt-6 pb-3">
          <Input
            id="search-exercises"
            placeholder="Search exercises name or muscle group..."
            value={searchQuery}
            variant="secondary"
            size="xl"
            className="rounded-2xl"
            onChange={(e) => setSearchQuery(e.target.value)}
            iconStart={<SearchIcon />}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 px-3">
        <div
          className={cn(
            buttonVariants({
              variant: 'secondary',
              size: 'sm',
            }),
            'px-3 justify-between',
          )}
          onClick={() => setOnlyMyExercises((prev) => !prev)}
        >
          <span className="text-sm text-foreground">My exercises</span>
          <Switch checked={onlyMyExercises} />
        </div>
        {suggestionsTrigger ? (
          <div className="shrink-0">{suggestionsTrigger}</div>
        ) : null}
      </div>
      {suggestionsPanel ? <div className="px-3">{suggestionsPanel}</div> : null}
    </div>
  )

  return (
    <div className="flex-1 min-h-0 h-full grid grid-rows-[auto_1fr]">
      <div className="p-4 flex gap-4">
        <DrawerGoBackButton className="relative m-0 top-0 left-0" />
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
              {subtitle !== false ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <div ref={setScrollParentRef} className="min-h-0 overflow-y-auto pb-10">
        {headerContent}

        {isLoading ? (
          <div className="p-3 space-y-2">
            <LoadingSkeleton count={8} />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="p-3 h-full min-h-0">
            <div className="text-center py-8 space-y-1">
              <p className="text-muted-foreground">
                {searchQuery.trim()
                  ? `No results for "${searchQuery.trim()}".`
                  : 'No exercises match this filter.'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {searchQuery.trim()
                  ? 'You can create a custom exercise with this name.'
                  : 'Try a different muscle group or clear filters.'}
              </p>
              {searchQuery.trim() ? (
                <div className="pt-4 flex justify-center">
                  <PremiumButtonWrapper
                    hasPremium={hasPremium}
                    tooltipText="Create custom exercises to reuse them in your workouts and plans."
                  >
                    <Button
                      variant="default"
                      iconStart={<PlusIcon />}
                      onClick={() => setCustomExerciseDialogOpen(true)}
                      disabled={!hasPremium}
                    >
                      Create exercise
                    </Button>
                  </PremiumButtonWrapper>
                </div>
              ) : null}
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
                <div className="px-3 py-1.5">
                  {itemRenderer(exercise, isSelected)}
                </div>
              )
            }}
          />
        ) : null}

        <CustomExerciseDialog
          open={customExerciseDialogOpen}
          onOpenChange={(nextOpen) => {
            setCustomExerciseDialogOpen(nextOpen)
            if (!nextOpen) setEditingExercise(null)
          }}
          categories={categories}
          initialName={searchQuery.trim() ? searchQuery.trim() : undefined}
          exercise={editingExercise ?? undefined}
        />

        <Dialog
          open={Boolean(deleteExercise)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDeleteExercise(null)
          }}
        >
          <DialogContent dialogTitle="Delete exercise">
            <DialogHeader>
              <DialogTitle>Delete exercise</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteExercise?.name}"? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteExercise(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                loading={isDeleting}
                disabled={!deleteExercise || isDeleting}
                onClick={async () => {
                  if (!deleteExercise) return
                  await removeCustomExercise({ id: deleteExercise.id })
                  setDeleteExercise(null)
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    <div className="-mx-4 pl-4 pr-12 overflow-x-auto hide-scrollbar bg-muted shadow-xs">
      <div className="flex gap-2 py-1.5 min-w-max">
        <button
          type="button"
          onClick={() => onSelectGroup(null)}
          className={cn(
            'shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all',
            'border whitespace-nowrap',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            selectedGroup === null
              ? 'border-primary text-foreground'
              : 'border-border bg-card hover:bg-muted/50 text-foreground',
          )}
        >
          All muscles
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

interface EquipmentFilterChipsProps {
  equipment: GQLEquipment[]
  selectedEquipment: GQLEquipment | null
  onSelectEquipment: (equipment: GQLEquipment | null) => void
}

function EquipmentFilterChips({
  equipment,
  selectedEquipment,
  onSelectEquipment,
}: EquipmentFilterChipsProps) {
  return (
    <div className="-mx-4 pl-4 pr-12 overflow-x-auto hide-scrollbar bg-muted shadow-xs">
      <div className="flex gap-2 py-1.5 min-w-max">
        <button
          type="button"
          onClick={() => onSelectEquipment(null)}
          className={cn(
            'shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all',
            'border whitespace-nowrap',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            selectedEquipment === null
              ? 'border-primary text-foreground'
              : 'border-border bg-card hover:bg-muted/50 text-foreground',
          )}
        >
          All
        </button>
        {equipment.map((equipmentItem) => (
          <button
            key={equipmentItem}
            type="button"
            onClick={() => onSelectEquipment(equipmentItem)}
            className={cn(
              'shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all',
              'border whitespace-nowrap',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selectedEquipment === equipmentItem
                ? 'border-primary text-foreground'
                : 'border-border bg-card hover:bg-muted/50 text-foreground',
            )}
          >
            {translateEquipment(equipmentItem)}
          </button>
        ))}
      </div>
    </div>
  )
}
