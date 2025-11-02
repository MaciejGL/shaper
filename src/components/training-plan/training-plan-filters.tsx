'use client'

import { Crown, Filter } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GQLFocusTag } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

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
  GQLFocusTag.Strength,
  // GQLFocusTag.Cardio,
  GQLFocusTag.BeginnerFriendly,
  GQLFocusTag.BodyRecomposition,
  GQLFocusTag.Powerlifting,
  GQLFocusTag.WeightLoss,
  // GQLFocusTag.Endurance,
  // GQLFocusTag.FunctionalFitness,
  // GQLFocusTag.Bodyweight,
]

interface TrainingPlanFiltersProps {
  activeFilter: FilterType
  selectedFocusTags: GQLFocusTag[]
  onFilterChange: (filter: FilterType) => void
  onToggleFocusTag: (tag: GQLFocusTag) => void
  onClearAllFilters: () => void
}

export function TrainingPlanFilters({
  activeFilter,
  selectedFocusTags,
  onFilterChange,
  onToggleFocusTag,
  onClearAllFilters,
}: TrainingPlanFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Main Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'tertiary'}
          size="sm"
          onClick={() => onFilterChange('all')}
        >
          All Plans
        </Button>
        <Button
          variant={activeFilter === 'free' ? 'default' : 'tertiary'}
          size="sm"
          onClick={() => onFilterChange('free')}
        >
          Free
        </Button>
        <Button
          variant={activeFilter === 'premium' ? 'default' : 'tertiary'}
          size="sm"
          onClick={() => onFilterChange('premium')}
          iconStart={
            <Crown
              className={cn(
                'text-amber-500',
                activeFilter === 'premium' && 'text-amber-600',
              )}
            />
          }
        >
          Premium
        </Button>

        {/* Advanced Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="tertiary"
              size="sm"
              iconOnly={<Filter />}
              className="ml-auto"
            >
              More Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {focusTagOptions.map((tag) => (
              <DropdownMenuItem
                key={tag}
                onClick={() => onToggleFocusTag(tag)}
                className="flex items-center justify-between"
              >
                <span>{focusTagLabels[tag]}</span>
                {selectedFocusTags.includes(tag) && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
            {selectedFocusTags.length > 0 && (
              <>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={onClearAllFilters}>
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Focus Tags */}
      {selectedFocusTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Focus:</span>
          {selectedFocusTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onToggleFocusTag(tag)}
            >
              {focusTagLabels[tag]} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export { focusTagLabels, type FilterType }
