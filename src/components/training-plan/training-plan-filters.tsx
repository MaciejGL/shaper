'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Filter,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { GQLDifficulty, GQLFocusTag } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Badge } from '../ui/badge'

export type SortOption = 'recommended' | 'popular' | 'newest' | 'shortest'

export const focusTagLabels: Record<GQLFocusTag, string> = {
  [GQLFocusTag.Strength]: 'Strength',
  [GQLFocusTag.Cardio]: 'Cardio',
  [GQLFocusTag.BodyRecomposition]: 'Body Recomposition',
  [GQLFocusTag.Powerlifting]: 'Powerlifting',
  [GQLFocusTag.WeightLoss]: 'Weight Loss',
  [GQLFocusTag.Endurance]: 'Endurance',
  [GQLFocusTag.FunctionalFitness]: 'Functional Fitness',
  [GQLFocusTag.Bodyweight]: 'Bodyweight',
  [GQLFocusTag.MuscleBuilding]: 'Muscle Building',
}

const sortLabels: Record<SortOption, string> = {
  recommended: 'Recommended',
  popular: 'Popular',
  newest: 'Newest',
  shortest: 'Shortest',
}

export const difficultyLabels: Record<GQLDifficulty, string> = {
  [GQLDifficulty.Beginner]: 'Beginner',
  [GQLDifficulty.Intermediate]: 'Intermediate',
  [GQLDifficulty.Advanced]: 'Advanced',
  [GQLDifficulty.Expert]: 'Expert',
}

const difficultyOptions: GQLDifficulty[] = [
  GQLDifficulty.Beginner,
  GQLDifficulty.Intermediate,
  GQLDifficulty.Advanced,
  GQLDifficulty.Expert,
]

interface TrainingPlanFiltersProps {
  selectedFocusTags: GQLFocusTag[]
  availableFocusTags: GQLFocusTag[]
  selectedDifficulty: GQLDifficulty | null
  daysPerWeek: number | null
  sessionMaxMins: number
  sort: SortOption
  resultsCount: number
  onToggleFocusTag: (tag: GQLFocusTag) => void
  onSetDifficulty: (difficulty: GQLDifficulty | null) => void
  onSetDaysPerWeek: (days: number | null) => void
  onSetSessionMaxMins: (mins: number) => void
  onSetSort: (sort: SortOption) => void
  onClearAllFilters: () => void
  onOpenPlanFinder: () => void
}

export function TrainingPlanFilters({
  selectedFocusTags,
  availableFocusTags,
  selectedDifficulty,
  daysPerWeek,
  sessionMaxMins,
  sort,
  resultsCount,
  onToggleFocusTag,
  onSetDifficulty,
  onSetDaysPerWeek,
  onSetSessionMaxMins,
  onSetSort,
  onClearAllFilters,
  onOpenPlanFinder,
}: TrainingPlanFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters =
    selectedFocusTags.length > 0 ||
    selectedDifficulty !== null ||
    daysPerWeek !== null ||
    sessionMaxMins < 90

  const activeFilterCount =
    selectedFocusTags.length +
    (selectedDifficulty ? 1 : 0) +
    (daysPerWeek ? 1 : 0) +
    (sessionMaxMins < 90 ? 1 : 0)

  return (
    <div className="space-y-3">
      {/* Filter bar: Filters button + Sort dropdown + Quick focus tags */}
      <div className="flex items-center gap-2">
        {/* Filters button */}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="md"
              iconStart={<Filter />}
              className={cn(
                'shrink-0 rounded-full',
                hasActiveFilters && 'border-primary text-primary bg-primary/5',
              )}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-[10px] size-4 rounded-full flex-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent
            className="h-[85vh] flex flex-col max-w-full"
            dialogTitle="Filters"
          >
            {/* Header with plans count on right */}
            <DrawerHeader className="shrink-0 border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle>Filters</DrawerTitle>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-sm"
                      onClick={onClearAllFilters}
                    >
                      Clear
                    </Button>
                  )}
                  <Badge
                    variant="secondary"
                    size="lg"
                    className="text-sm font-semibold tabular-nums text-foreground"
                  >
                    {resultsCount} plan{resultsCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-4 py-5 space-y-6 pb-24">
                {/* Quiz Banner - 56px tappable row */}
                <button
                  className="w-full min-h-14 rounded-xl bg-muted/50 hover:bg-muted transition-colors flex items-center justify-between px-4 active:scale-[0.98]"
                  onClick={() => {
                    setIsOpen(false)
                    onOpenPlanFinder()
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      Not sure? Take the 30-second quiz
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* Days per week Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Days per week
                    </Label>
                    <span className="text-sm font-semibold tabular-nums">
                      {daysPerWeek ? `${daysPerWeek} days` : 'Any'}
                    </span>
                  </div>
                  <div className="pt-2 pb-1">
                    <Slider
                      value={[daysPerWeek ?? 0]}
                      min={0}
                      max={6}
                      step={1}
                      onValueChange={([val]) =>
                        onSetDaysPerWeek(val === 0 ? null : val)
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground -mx-2">
                    <span className="min-w-8 text-center">Any</span>
                    <span className="min-w-8 text-center">1</span>
                    <span className="min-w-8 text-center">2</span>
                    <span className="min-w-8 text-center">3</span>
                    <span className="min-w-8 text-center">4</span>
                    <span className="min-w-8 text-center">5</span>
                    <span className="min-w-8 text-center">6</span>
                  </div>
                </div>

                {/* Session Length Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Session length
                    </Label>
                    <span className="text-sm font-semibold tabular-nums">
                      {sessionMaxMins >= 90 ? 'Any' : `≤${sessionMaxMins} min`}
                    </span>
                  </div>
                  <div className="pt-2 pb-1">
                    <Slider
                      value={[sessionMaxMins]}
                      min={15}
                      max={90}
                      step={15}
                      onValueChange={([val]) => onSetSessionMaxMins(val)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground -mx-2">
                    <span className="min-w-8 text-center">15</span>
                    <span className="min-w-8 text-center">30</span>
                    <span className="min-w-8 text-center">45</span>
                    <span className="min-w-8 text-center">60</span>
                    <span className="min-w-8 text-center">75</span>
                    <span className="min-w-8 text-center">Any</span>
                  </div>
                </div>

                {/* Level (single-select segmented chips) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Level
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {difficultyOptions.map((diff) => {
                      const selected = selectedDifficulty === diff
                      return (
                        <button
                          key={diff}
                          onClick={() =>
                            onSetDifficulty(selected ? null : diff)
                          }
                          className={cn(
                            'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 active:scale-[0.97]',
                            'min-h-[44px]',
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-input hover:bg-muted/50',
                          )}
                        >
                          {difficultyLabels[diff]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Focus / Goal (multi-select chips) */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Focus
                  </Label>
                  {availableFocusTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableFocusTags.map((tag) => {
                        const selected = selectedFocusTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            onClick={() => onToggleFocusTag(tag)}
                            className={cn(
                              'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 active:scale-[0.97]',
                              'min-h-[44px]',
                              selected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-input hover:bg-muted/50',
                            )}
                          >
                            {focusTagLabels[tag]}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No focus tags available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <DrawerFooter className="border-t shrink-0">
              <div className="flex gap-3">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClearAllFilters}
                  >
                    Reset
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={resultsCount === 0}
                  >
                    Done ({resultsCount})
                  </Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="md"
              className="shrink-0 rounded-full"
              iconStart={<ArrowUpDown />}
              iconEnd={<ChevronDown />}
            >
              {sortLabels[sort]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(v) => onSetSort(v as SortOption)}
            >
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {sortLabels[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="outline"
                size="md"
                className="shrink-0 rounded-full"
                iconStart={<X />}
                onClick={onClearAllFilters}
              >
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
