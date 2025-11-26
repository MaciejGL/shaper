'use client'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { GQLMuscleGroupCategoriesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface MuscleGroupMultiSelectProps {
  label: string
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  required?: boolean
}

function MuscleGroupMultiSelect({
  label,
  categories,
  selectedIds,
  onSelect,
  required,
}: MuscleGroupMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const allMuscles =
    categories?.flatMap((c) =>
      c.muscles.map((m) => ({ ...m, categoryName: c.name })),
    ) ?? []

  const selectedMuscles = allMuscles.filter((m) => selectedIds.includes(m.id))

  const handleSelect = (muscleId: string) => {
    if (selectedIds.includes(muscleId)) {
      onSelect(selectedIds.filter((id) => id !== muscleId))
    } else {
      onSelect([...selectedIds, muscleId])
    }
  }

  const handleRemove = (muscleId: string) => {
    onSelect(selectedIds.filter((id) => id !== muscleId))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : 'Select muscle groups...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search muscle groups..." />
            <CommandList>
              <CommandEmpty>No muscle group found.</CommandEmpty>
              {categories?.map((category) => (
                <CommandGroup key={category.id} heading={category.name}>
                  {category.muscles.map((muscle) => (
                    <CommandItem
                      key={muscle.id}
                      value={`${muscle.name} ${muscle.alias || ''}`}
                      onSelect={() => handleSelect(muscle.id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedIds.includes(muscle.id)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {muscle.alias || muscle.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMuscles.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedMuscles.map((muscle) => (
            <Badge key={muscle.id} variant="secondary" className="pr-1">
              {muscle.alias || muscle.name}
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => handleRemove(muscle.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {muscle.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface MuscleGroupSelectorProps {
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  selectedPrimaryMuscleGroups: {
    id: string
  }[]
  selectedSecondaryMuscleGroups: {
    id: string
  }[]
  onPrimaryMuscleGroupsChange: (
    muscleGroups: {
      id: string
    }[],
  ) => void
  onSecondaryMuscleGroupsChange: (
    muscleGroups: {
      id: string
    }[],
  ) => void
}

export function MuscleGroupSelector({
  categories,
  selectedPrimaryMuscleGroups,
  selectedSecondaryMuscleGroups,
  onPrimaryMuscleGroupsChange,
  onSecondaryMuscleGroupsChange,
}: MuscleGroupSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-6 w-full">
      <MuscleGroupMultiSelect
        label="Primary Muscles"
        categories={categories}
        selectedIds={selectedPrimaryMuscleGroups.map((mg) => mg.id)}
        onSelect={(ids) =>
          onPrimaryMuscleGroupsChange(ids.map((id) => ({ id })))
        }
        required
      />

      <MuscleGroupMultiSelect
        label="Secondary Muscle"
        categories={categories}
        selectedIds={selectedSecondaryMuscleGroups.map((mg) => mg.id)}
        onSelect={(ids) =>
          onSecondaryMuscleGroupsChange(ids.map((id) => ({ id })))
        }
      />
    </div>
  )
}
