'use client'

import { Check, Search } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface ExerciseOption {
  id: string
  name: string
  equipment: string | null
  muscleGroups: string[]
}

interface ExerciseSearchComboboxProps {
  onExerciseSelected: (exercise: ExerciseOption) => void
  placeholder?: string
  className?: string
}

export function ExerciseSearchCombobox({
  onExerciseSelected,
  placeholder = 'Search exercises...',
  className,
}: ExerciseSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Debounce search query by 300ms for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Get all exercises
  const { data, isLoading } = useFitspaceGetExercisesQuery()

  // Combine public and trainer exercises
  const allExercises = useMemo(() => {
    if (!data?.getExercises) return []

    const exercises = [
      ...(data.getExercises.publicExercises || []),
      ...(data.getExercises.trainerExercises || []),
    ]

    return exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      equipment: ex.equipment,
      muscleGroups:
        ex.muscleGroups
          ?.map((mg) => mg.alias || mg.groupSlug || '')
          .filter(Boolean) || [],
    }))
  }, [data])

  // Filter exercises based on search query
  const filteredExercises = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return allExercises.slice(0, 20)

    const query = debouncedSearchQuery.toLowerCase()
    return allExercises
      .filter((exercise) => {
        // Search by exercise name
        const nameMatch = exercise.name.toLowerCase().includes(query)

        // Search by equipment
        const equipmentMatch = exercise.equipment?.toLowerCase().includes(query)

        // Search by muscle groups
        const muscleGroupMatch = exercise.muscleGroups.some((mg) =>
          mg.toLowerCase().includes(query),
        )

        return nameMatch || equipmentMatch || muscleGroupMatch
      })
      .slice(0, 50)
  }, [allExercises, debouncedSearchQuery])

  const hasResults = filteredExercises.length > 0
  const showResults = isOpen && (searchQuery.length > 0 || hasResults)

  const handleSelectExercise = (exercise: ExerciseOption) => {
    onExerciseSelected(exercise)
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
      e.currentTarget.blur()
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value.length > 0 || hasResults) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.length > 0 || hasResults) setIsOpen(true)
          }}
          onBlur={(e) => {
            // Don't close if clicking on the dropdown itself
            const relatedTarget = e.relatedTarget as HTMLElement
            if (relatedTarget?.closest('#exercise-search-results')) {
              return
            }
            // Stable delay to prevent flickering
            setTimeout(() => setIsOpen(false), 150)
          }}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          role="combobox"
          aria-controls="exercise-search-results"
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          id="exercise-search-results"
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
          style={{
            animation: 'fadeIn 150ms ease-out',
          }}
        >
          <Command className="rounded-md">
            <CommandList className="max-h-96">
              {/* Loading State */}
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading exercises...
                </div>
              )}

              {/* Search Results */}
              {!isLoading && hasResults && (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {filteredExercises.length} exercise
                    {filteredExercises.length !== 1 ? 's' : ''} found
                  </div>
                  {filteredExercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      className="cursor-pointer data-[selected=true]:bg-accent/50"
                      onSelect={() =>
                        handleSelectExercise(exercise as ExerciseOption)
                      }
                    >
                      <div className="flex w-full items-center justify-between py-1">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-medium text-sm truncate">
                            {exercise.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {exercise.equipment || 'No equipment'}
                            {exercise.muscleGroups.length > 0 &&
                              ` • ${exercise.muscleGroups.slice(0, 2).join(', ')}`}
                          </div>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectExercise(exercise as ExerciseOption)
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                          }}
                          iconOnly={<Check />}
                          className="ml-2 shrink-0 h-8 w-8 touch-manipulation"
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty States */}
              {!isLoading && !debouncedSearchQuery && !hasResults && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search exercises
                </div>
              )}

              {!isLoading && debouncedSearchQuery && !hasResults && (
                <CommandEmpty className="py-6 text-center text-sm">
                  No exercises found for "{debouncedSearchQuery}"
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
