'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { SparklesIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { useAiSuggestions, type ExerciseSuggestion } from './use-ai-suggestions'

interface AiExerciseSuggestionsProps {
  workoutType?: string
  onAddExercises: (exerciseIds: string[]) => void
  isAddingExercises?: boolean
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3 p-4 rounded-xl border bg-card">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-4 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  )
}

function SuggestionItem({
  suggestion,
  isSelected,
  onToggle,
  disabled,
}: {
  suggestion: ExerciseSuggestion
  isSelected: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg text-left transition-all w-full',
        'border hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none',
        isSelected ? 'border-primary bg-primary/5' : 'border-border',
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="pointer-events-none"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{suggestion.exerciseName}</p>
        <p className="text-xs text-muted-foreground">{suggestion.muscleGroup}</p>
      </div>
    </button>
  )
}

function SuggestionsContent({
  suggestions,
  context,
  selectedIds,
  onToggle,
  onAddSelected,
  onClose,
  selectedCount,
  isAdding,
}: {
  suggestions: ExerciseSuggestion[]
  context: string
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onAddSelected: () => void
  onClose: () => void
  selectedCount: number
  isAdding?: boolean
}) {
  return (
    <div className="space-y-3 p-4 rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{context}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          iconOnly={<XIcon />}
          onClick={onClose}
          className="shrink-0 -mt-1 -mr-1"
        >
          Close
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map(suggestion => (
          <SuggestionItem
            key={suggestion.exerciseId}
            suggestion={suggestion}
            isSelected={selectedIds.has(suggestion.exerciseId)}
            onToggle={() => onToggle(suggestion.exerciseId)}
            disabled={isAdding}
          />
        ))}
      </div>

      <Button
        onClick={onAddSelected}
        disabled={selectedCount === 0 || isAdding}
        loading={isAdding}
        className="w-full"
      >
        Add {selectedCount} to workout
      </Button>
    </div>
  )
}

export function AiExerciseSuggestions({
  workoutType,
  onAddExercises,
  isAddingExercises,
}: AiExerciseSuggestionsProps) {
  const {
    suggestions,
    context,
    isLoading,
    error,
    hasSuggestions,
    selectedIds,
    selectedCount,
    selectedExercises,
    fetchSuggestions,
    toggleSelection,
    reset,
  } = useAiSuggestions()

  const handleAddSelected = () => {
    const exerciseIds = selectedExercises.map(e => e.exerciseId)
    onAddExercises(exerciseIds)
    // Reset after adding (will be called by parent when done)
  }

  const showButton = !hasSuggestions && !isLoading && !error
  const showResults = hasSuggestions && !isLoading

  return (
    <div className="space-y-3">
      {showButton && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => fetchSuggestions({ workoutType })}
          iconStart={<SparklesIcon />}
        >
          Suggest exercises
        </Button>
      )}

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SuggestionsSkeleton />
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-xl border border-destructive/50 bg-destructive/10"
          >
            <p className="text-sm text-destructive">{error.message}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={reset}
            >
              Dismiss
            </Button>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <SuggestionsContent
              suggestions={suggestions}
              context={context}
              selectedIds={selectedIds}
              onToggle={toggleSelection}
              onAddSelected={handleAddSelected}
              onClose={reset}
              selectedCount={selectedCount}
              isAdding={isAddingExercises}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

