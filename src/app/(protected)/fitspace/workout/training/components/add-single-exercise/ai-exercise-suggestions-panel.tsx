'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  type AiExerciseSuggestionsExercise,
  useAiExerciseSuggestionsContext,
} from './ai-exercise-suggestions-context'
import { SelectableExerciseItem } from './selectable-exercise-item'
import type { ExerciseSuggestion } from './use-ai-suggestions'
import { getExerciseMuscleDisplay } from './utils'

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-1 pr-3 rounded-lg border border-border shadow-md"
          >
            <Skeleton className="size-20 rounded-md shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="size-6 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SuggestionsResultsContent({
  suggestions,
  allExercises,
  context,
  selectedIds,
  onToggle,
  onClose,
}: {
  suggestions: ExerciseSuggestion[]
  allExercises: AiExerciseSuggestionsExercise[]
  context: string
  selectedIds: string[]
  onToggle: (id: string) => void
  onClose: () => void
}) {
  const exercisesMap = new Map(allExercises.map((ex) => [ex.id, ex]))

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start justify-between gap-2 pb-2">
        <p className="text-sm font-medium text-foreground">{context}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          iconOnly={<XIcon />}
          onClick={onClose}
          className="shrink-0 -mt-1"
        >
          Close
        </Button>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const exercise = exercisesMap.get(suggestion.exerciseId)
          if (!exercise) return null

          const muscleDisplay = getExerciseMuscleDisplay(exercise)

          return (
            <SelectableExerciseItem
              key={suggestion.exerciseId}
              id={suggestion.exerciseId}
              name={exercise.name}
              muscleDisplay={muscleDisplay}
              images={
                exercise.images as ({ medium?: string | null } | null)[] | null
              }
              videoUrl={exercise.videoUrl}
              isSelected={selectedIds.includes(suggestion.exerciseId)}
              onToggle={onToggle}
              detailExercise={exercise}
            />
          )
        })}
      </div>
    </div>
  )
}

export function AiExerciseSuggestionsPanel() {
  const {
    suggestions,
    context,
    isLoading,
    error,
    hasSuggestions,
    allExercises,
    selectedExerciseIds,
    onToggleExercise,
    reset,
  } = useAiExerciseSuggestionsContext()

  const showLoading = isLoading
  const showError = !!error && !isLoading && !hasSuggestions
  const showResults = hasSuggestions && !isLoading

  if (!showLoading && !showError && !showResults) return null

  return (
    <div className="mt-2">
      <AnimatePresence mode="wait">
        {showLoading && (
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

        {showError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-destructive/50 bg-destructive/10"
          >
            <div className="p-3">
              <p className="text-sm text-destructive">{error.message}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={reset}
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="bg-muted dark:bg-black/20 rounded-lg -mx-3 px-3"
          >
            <div className="pt-4 pb-6">
              <SuggestionsResultsContent
                suggestions={suggestions}
                allExercises={allExercises}
                context={context}
                selectedIds={selectedExerciseIds}
                onToggle={onToggleExercise}
                onClose={reset}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
