'use client'

import { Check, Search, SettingsIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { GQLAvailableExercisesForProgressQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface ExerciseSelectionProps {
  availableExercises?: GQLAvailableExercisesForProgressQuery['exercisesProgressByUser']
  selectedExerciseIds: string[]
  onSelectionChange: (exerciseIds: string[]) => void
  maxSelections?: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isLoading: boolean
}

export function ExerciseSelection({
  availableExercises,
  selectedExerciseIds,
  onSelectionChange,
  maxSelections = 6,
  isOpen,
  setIsOpen,
  isLoading,
}: ExerciseSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter exercises based on search term
  const filteredExercises = availableExercises?.filter(
    (exercise) =>
      exercise.baseExercise?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      exercise.baseExercise?.muscleGroups.some((mg) =>
        mg.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  const handleToggleExercise = (exerciseId: string) => {
    const isSelected = selectedExerciseIds.includes(exerciseId)

    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedExerciseIds.filter((id) => id !== exerciseId))
    } else {
      // Add to selection (if under limit)
      if (selectedExerciseIds.length < maxSelections) {
        onSelectionChange([...selectedExerciseIds, exerciseId])
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          iconOnly={<SettingsIcon />}
          disabled={!availableExercises || isLoading}
        >
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent
        dialogTitle="Select Exercises to Track"
        fullScreen
        className="pb-0"
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Select Exercises to Track</DialogTitle>
            <DialogDescription>
              Choose up to {maxSelections} exercises you want to track your
              progress for. Only these exercises will be loaded and displayed on
              your progress page.
            </DialogDescription>
          </DialogHeader>

          {/* Search - Fixed at top */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <Input
              id="search"
              iconStart={<Search />}
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Exercise List - Takes remaining space and scrolls */}
          <div className="flex-1 min-h-0  overflow-y-auto">
            <div className="space-y-2">
              {filteredExercises?.map((exercise) => {
                const isSelected = selectedExerciseIds.includes(
                  exercise.baseExercise?.id || '',
                )
                const isMaxReached =
                  selectedExerciseIds.length >= maxSelections && !isSelected

                return (
                  <div
                    key={exercise.baseExercise?.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors shadow-neuro-light dark:shadow-neuro-dark',
                      isSelected
                        ? 'bg-accent/50'
                        : isMaxReached
                          ? 'border-muted bg-muted/20 opacity-50  '
                          : 'border-border hover:bg-muted/50',
                    )}
                    onClick={() =>
                      !isMaxReached &&
                      handleToggleExercise(exercise.baseExercise?.id || '')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {exercise.baseExercise?.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {exercise.baseExercise?.muscleGroups
                          .slice(0, 2)
                          .map((mg, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {mg.alias || mg.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <div className="ml-2">
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selection Count - Fixed at bottom */}
          <div className="flex-shrink-0 py-2 text-xs text-muted-foreground text-center">
            {selectedExerciseIds.length}/{maxSelections} exercises selected
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
