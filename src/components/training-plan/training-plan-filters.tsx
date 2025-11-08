'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Crown, Filter } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GQLDifficulty, GQLFocusTag } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

type FilterType = 'all' | 'free' | 'premium'

const focusTagLabels: Record<GQLFocusTag, string> = {
  [GQLFocusTag.Strength]: 'Strength',
  [GQLFocusTag.Cardio]: 'Cardio',
  [GQLFocusTag.BeginnerFriendly]: 'Beginner Friendly',
  [GQLFocusTag.BodyRecomposition]: 'Body Recomposition',
  [GQLFocusTag.Powerlifting]: 'Powerlifting',
  [GQLFocusTag.WeightLoss]: 'Weight Loss',
  [GQLFocusTag.Endurance]: 'Endurance',
  [GQLFocusTag.FunctionalFitness]: 'Functional Fitness',
  [GQLFocusTag.Bodyweight]: 'Bodyweight',
  [GQLFocusTag.MuscleBuilding]: 'Muscle Building',
}

const focusTagOptions: GQLFocusTag[] = [
  GQLFocusTag.MuscleBuilding,
  GQLFocusTag.Strength,
  // GQLFocusTag.Cardio,
  // GQLFocusTag.BeginnerFriendly,
  GQLFocusTag.BodyRecomposition,
  GQLFocusTag.Powerlifting,
  GQLFocusTag.WeightLoss,
  // GQLFocusTag.Endurance,
  // GQLFocusTag.FunctionalFitness,
  // GQLFocusTag.Bodyweight,
]

const difficultyLabels: Record<GQLDifficulty, string> = {
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
  activeFilter: FilterType
  selectedFocusTags: GQLFocusTag[]
  selectedDifficulties: GQLDifficulty[]
  onFilterChange: (filter: FilterType) => void
  onToggleFocusTag: (tag: GQLFocusTag) => void
  onToggleDifficulty: (difficulty: GQLDifficulty) => void
  onClearAllFilters: () => void
}

export function TrainingPlanFilters({
  activeFilter,
  selectedFocusTags,
  selectedDifficulties,
  onFilterChange,
  onToggleFocusTag,
  onToggleDifficulty,
  onClearAllFilters,
}: TrainingPlanFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Main Filter Buttons */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full">
        <Tabs
          defaultValue="all"
          onValueChange={(value) => onFilterChange(value as FilterType)}
        >
          <TabsList
            variant="secondary"
            className="w-full grid-cols-3"
            size="xl"
            rounded="2xl"
          >
            <TabsTrigger value="all" rounded="2xl">
              All Plans
            </TabsTrigger>
            <TabsTrigger value="premium" rounded="2xl">
              <Crown
                className={cn(
                  'text-amber-500',
                  activeFilter === 'premium' && 'text-amber-600',
                )}
              />{' '}
              Premium
            </TabsTrigger>
            <TabsTrigger value="free" rounded="2xl">
              Free
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Advanced Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="tertiary"
              size="icon-lg"
              iconOnly={<Filter />}
              className="ml-auto rounded-2xl"
            >
              More Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-w-72 min-w-52">
            <DropdownMenuLabel>Level</DropdownMenuLabel>
            {difficultyOptions.map((difficulty) => (
              <DropdownMenuCheckboxItem
                key={difficulty}
                checked={selectedDifficulties.includes(difficulty)}
                onCheckedChange={() => onToggleDifficulty(difficulty)}
                onSelect={(e) => e.preventDefault()}
              >
                {difficultyLabels[difficulty]}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Focus Areas</DropdownMenuLabel>
            {focusTagOptions.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedFocusTags.includes(tag)}
                onCheckedChange={() => onToggleFocusTag(tag)}
                onSelect={(e) => e.preventDefault()}
              >
                {focusTagLabels[tag]}
              </DropdownMenuCheckboxItem>
            ))}
            {(selectedFocusTags.length > 0 ||
              selectedDifficulties.length > 0) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClearAllFilters}>
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      <AnimatePresence initial={false}>
        {(selectedFocusTags.length > 0 || selectedDifficulties.length > 0) && (
          <motion.div
            layout
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="origin-top"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <AnimatePresence mode="popLayout">
                {selectedDifficulties.map((difficulty) => (
                  <motion.div
                    key={difficulty}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      size="lg"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onToggleDifficulty(difficulty)}
                    >
                      {difficultyLabels[difficulty]} ×
                    </Badge>
                  </motion.div>
                ))}
                {selectedFocusTags.map((tag) => (
                  <motion.div
                    key={tag}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="secondary"
                      size="lg"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onToggleFocusTag(tag)}
                    >
                      {focusTagLabels[tag]} ×
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { difficultyLabels, focusTagLabels, type FilterType }
