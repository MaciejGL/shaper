import { cn } from '@/lib/utils'

import type { HighLevelGroup } from '@/config/muscles'
import type { GQLEquipment } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

interface MyExercisesFiltersProps {
  muscleGroups: HighLevelGroup[]
  selectedMuscleGroup: HighLevelGroup | null
  onMuscleGroupChange: (next: HighLevelGroup | null) => void

  equipment: GQLEquipment[]
  selectedEquipment: GQLEquipment | null
  onEquipmentChange: (next: GQLEquipment | null) => void

  variant?: 'stack' | 'popover'
}

export function MyExercisesFilters({
  muscleGroups,
  selectedMuscleGroup,
  onMuscleGroupChange,
  equipment,
  selectedEquipment,
  onEquipmentChange,
  variant = 'stack',
}: MyExercisesFiltersProps) {
  const showMuscleFilters = muscleGroups.length > 1
  const showEquipmentFilters = equipment.length > 1

  if (!showMuscleFilters && !showEquipmentFilters) return null

  return (
    <div className={variant === 'popover' ? 'space-y-4' : 'space-y-2'}>
      {showMuscleFilters ? (
        <FilterChipsRow<HighLevelGroup>
          label="Muscle"
          options={muscleGroups}
          selected={selectedMuscleGroup}
          onChange={onMuscleGroupChange}
          variant={variant}
        />
      ) : null}

      {showEquipmentFilters ? (
        <FilterChipsRow<GQLEquipment>
          label="Equipment"
          options={equipment}
          selected={selectedEquipment}
          onChange={onEquipmentChange}
          getLabel={(value) => translateEquipment(value)}
          variant={variant}
        />
      ) : null}
    </div>
  )
}

interface FilterChipsRowProps<T extends string> {
  label: string
  options: T[]
  selected: T | null
  onChange: (next: T | null) => void
  getLabel?: (value: T) => string
  variant?: 'stack' | 'popover'
}

function FilterChipsRow<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel,
  variant = 'stack',
}: FilterChipsRowProps<T>) {
  const rowWrapperClassName =
    variant === 'popover'
      ? 'flex flex-wrap gap-2'
      : 'flex gap-2 py-1.5 min-w-max'

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {variant === 'popover' ? (
        <div className={rowWrapperClassName}>
          <button
            type="button"
            onClick={() => onChange(null)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'border whitespace-nowrap',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              selected === null
                ? 'border-primary text-foreground'
                : 'border-border bg-card hover:bg-muted/50 text-foreground',
            )}
          >
            All
          </button>
          {options.map((option) => {
            const optionLabel = getLabel ? getLabel(option) : option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  'border whitespace-nowrap',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  selected === option
                    ? 'border-primary text-foreground'
                    : 'border-border bg-card hover:bg-muted/50 text-foreground',
                )}
              >
                {optionLabel}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="-mx-4 pl-4 pr-4 overflow-x-auto hide-scrollbar bg-muted/50 shadow-xs">
          <div className={rowWrapperClassName}>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                'border whitespace-nowrap',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected === null
                  ? 'border-primary text-foreground'
                  : 'border-border bg-card hover:bg-muted/50 text-foreground',
              )}
            >
              All
            </button>
            {options.map((option) => {
              const optionLabel = getLabel ? getLabel(option) : option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(option)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    'border whitespace-nowrap',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected === option
                      ? 'border-primary text-foreground'
                      : 'border-border bg-card hover:bg-muted/50 text-foreground',
                  )}
                >
                  {optionLabel}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

