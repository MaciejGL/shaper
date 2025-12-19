'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, SparklesIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'

import { SelectableExerciseItem } from './selectable-exercise-item'
import { useAiSuggestions } from './use-ai-suggestions'
import type { ExerciseSuggestion } from './use-ai-suggestions'
import { getExerciseMuscleDisplay } from './utils'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface AiExerciseSuggestionsProps {
  workoutType?: string
  allExercises: Exercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (exerciseId: string) => void
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3 pt-3">
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
  allExercises: Exercise[]
  context: string
  selectedIds: string[]
  onToggle: (id: string) => void
  onClose: () => void
}) {
  const exercisesMap = new Map(allExercises.map((ex) => [ex.id, ex]))

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start justify-between gap-2 px-1 pb-2">
        <p className="text-sm text-muted-foreground">{context}</p>
        <Button
          variant="tertiary"
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
            />
          )
        })}
      </div>
    </div>
  )
}

export function AiExerciseSuggestions({
  workoutType,
  allExercises,
  selectedExerciseIds,
  onToggleExercise,
}: AiExerciseSuggestionsProps) {
  const {
    suggestions,
    context,
    isLoading,
    error,
    hasSuggestions,
    fetchSuggestions,
    reset,
  } = useAiSuggestions({
    onSuggestionsLoaded: (exerciseIds) => {
      // Auto-select first 2 suggestions
      exerciseIds.forEach((id) => {
        if (!selectedExerciseIds.includes(id)) {
          onToggleExercise(id)
        }
      })
    },
  })

  const showGenerateButton = !hasSuggestions && !isLoading && !error
  const showResults = hasSuggestions && !isLoading

  return (
    <div>
      <div className="rounded-full border-none bg-primary/5 px-1 py-1 shadow-md mb-4">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white/60 dark:bg-black/60 rounded-full p-3">
              <SparklesIcon className="size-5 shrink-0 text-amber-500 animate-pulse" />
            </div>
            <span className="text-sm font-medium text-foreground truncate">
              Smart suggestions
            </span>
          </div>
          {showGenerateButton && (
            <Button
              variant="variantless"
              onClick={() => fetchSuggestions({ workoutType })}
              className="bg-white/60 dark:bg-black/60 dark:hover:bg-black/40 hover:bg-white/40 h-full rounded-full"
              iconEnd={<ChevronRight className="size-5" />}
            >
              Generate
            </Button>
          )}
        </div>
      </div>
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
            className="mt-2 p-3 rounded-lg border border-destructive/50 bg-destructive/10"
          >
            <p className="text-sm text-destructive">{error.message}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={reset}>
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
            className="bg-muted/20 dark:bg-black/20 -mx-4 px-4 pt-4 pb-6 rounded-lg"
          >
            <SuggestionsResultsContent
              suggestions={suggestions}
              allExercises={allExercises}
              context={context}
              selectedIds={selectedExerciseIds}
              onToggle={onToggleExercise}
              onClose={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
