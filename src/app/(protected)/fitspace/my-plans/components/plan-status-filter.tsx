import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { PlanStatus } from '../types'

export type FilterOption = 'all' | PlanStatus

interface PlanStatusFilterProps {
  selectedFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  counts: Record<FilterOption, number>
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Plans' },
  { value: PlanStatus.Active, label: 'Active' },
  { value: PlanStatus.Paused, label: 'Paused' },
  { value: PlanStatus.Template, label: 'Templates' },
  { value: PlanStatus.Completed, label: 'Completed' },
]

export function PlanStatusFilter({
  selectedFilter,
  onFilterChange,
  counts,
}: PlanStatusFilterProps) {
  const selectedOption = FILTER_OPTIONS.find(
    (opt) => opt.value === selectedFilter,
  )
  const selectedCount = counts[selectedFilter] || 0

  return (
    <Select value={selectedFilter} onValueChange={onFilterChange}>
      <SelectTrigger
        variant="tertiary"
        size="md"
        className="p-6 w-full bg-card rounded-xl"
      >
        <SelectValue>
          <p>{selectedOption?.label}</p>
          {selectedCount > 0 && (
            <div className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {selectedCount}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FILTER_OPTIONS.map((option) => {
          const count = counts[option.value] || 0
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-3 w-full">
                <p>{option.label}</p>
                {count > 0 && (
                  <div className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {count}
                  </div>
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
