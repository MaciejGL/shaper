import { AnimatePresence, motion } from 'framer-motion'
import { Check, PlusIcon, SparklesIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { Fragment, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VideoPreview } from '@/components/video-preview'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetAiExerciseSuggestionsMutation,
  useFitspaceAddAiExerciseToWorkoutMutation,
  useFitspaceGetAiExerciseSuggestionsMutation,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

const AI_LOADING_TEXT = [
  'Looking at your workout logs',
  'Wooo! You are on fire! 🔥',
  'Let me match you with the best exercises',
  'I found some great exercises for you',
  'Let me calculate the optimal sets and reps',
  'Finalizing your workout plan',
  'Get ready for more!',
]

function useAiLoadingText() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      if (index === AI_LOADING_TEXT.length - 1) {
        // Keep the last item by not incrementing the index
        setIndex(AI_LOADING_TEXT.length - 1)
      } else {
        setIndex((index) => index + 1)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [index])
  return AI_LOADING_TEXT[index]
}

export function AiSuggestion() {
  const [dayId] = useQueryState('day')

  const {
    mutateAsync: getAiExerciseSuggestions,
    isPending: isGettingAiExerciseSuggestion,
    data: aiExerciseSuggestion,
  } = useFitspaceGetAiExerciseSuggestionsMutation()

  const aiResults = aiExerciseSuggestion?.getAiExerciseSuggestions

  return (
    <>
      <div className="space-y-2">
        <Button
          variant="secondary"
          iconStart={<SparklesIcon className="text-amber-500" />}
          loading={isGettingAiExerciseSuggestion}
          disabled={!dayId}
          onClick={() => dayId && getAiExerciseSuggestions({ dayId: dayId })}
          className="grow w-full"
        >
          Get suggestions
        </Button>
      </div>
      <AnimatePresence>
        {isGettingAiExerciseSuggestion && <AiLoadingText />}
        {aiResults &&
          aiResults.map((aiResult) => (
            <AiSuggestionItem key={aiResult.exercise.id} aiResult={aiResult} />
          ))}
      </AnimatePresence>
    </>
  )
}

function AiSuggestionItem({
  aiResult,
}: {
  aiResult: GQLFitspaceGetAiExerciseSuggestionsMutation['getAiExerciseSuggestions'][number]
}) {
  const invalidateQueries = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()
  const [dayId] = useQueryState('day')
  const { exercises } = useWorkout()
  const { mutateAsync: addAiExerciseToWorkout, isPending: isLoading } =
    useFitspaceAddAiExerciseToWorkoutMutation({
      onSuccess: async () => {
        if (!dayId) return
        await invalidateQueries({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId,
          }),
        })
        await invalidateQueries({
          queryKey: useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
        })
      },
    })

  const handleAddAiExerciseToWorkout = async (exerciseId: string) => {
    if (!dayId || !aiResult) return

    await addAiExerciseToWorkout({
      input: {
        dayId: dayId,
        exerciseId: exerciseId,
        sets: aiResult.sets.map((set) => ({
          reps: set?.reps ?? 0,
          rpe: set?.rpe,
        })),
      },
    })
  }

  const isAdded = exercises.some(
    (exercise) => exercise.name === aiResult.exercise.name,
  )
  return (
    <motion.div
      key={aiResult.exercise.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'shadow-neuro-light dark:shadow-neuro-dark bg-card p-4 pb-0 rounded-lg space-y-4 col-span-full',
        isAdded && 'pb-4',
      )}
    >
      <div className="flex gap-2 items-start justify-between">
        <div className="flex gap-2">
          <SparklesIcon className="size-4 text-amber-500 shrink-0 mt-1.5" />
          <p className="text-lg font-medium">{aiResult?.exercise.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          {aiResult?.exercise.videoUrl && (
            <VideoPreview url={aiResult.exercise.videoUrl} />
          )}
          {isAdded ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Button
              variant="default"
              size="icon-md"
              iconOnly={<PlusIcon />}
              loading={isLoading}
              disabled={isLoading}
              onClick={() => handleAddAiExerciseToWorkout(aiResult.exercise.id)}
            >
              Add Exercise
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {aiResult.exercise.equipment && (
          <Badge variant="secondary" className="capitalize">
            {translateEquipment(aiResult.exercise.equipment)}
          </Badge>
        )}
        {aiResult.exercise.muscleGroups.map((group, index) => (
          <Badge
            variant="secondary"
            className="capitalize"
            key={`${group.groupSlug}-${index}`}
          >
            {group.alias}
          </Badge>
        ))}
      </div>
      {!isAdded && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {aiResult.aiMeta.explanation}
          </p>
        </div>
      )}

      {!isAdded && (
        <div className="grid grid-cols-[50px_80px_80px] gap-2 text-center border-t border-border -mx-4 p-2 rounded-b-lg">
          <p className="text-muted-foreground text-sm"></p>
          <p className="text-muted-foreground text-sm">Reps</p>
          <p className="text-muted-foreground text-sm">RPE</p>
          {aiResult.sets.map((set, index) => (
            <Fragment key={`${index}-${set?.reps}-${set?.rpe}`}>
              <p className="text-muted-foreground text-sm">Set {index + 1}.</p>
              <p className="text-muted-foreground text-sm">{set?.reps}</p>
              <p className="text-muted-foreground text-sm">{set?.rpe}</p>
            </Fragment>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function AiLoadingText() {
  const loadingText = useAiLoadingText()
  const [dots, setDots] = useState('')
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots.length < 3 ? dots + '.' : ''))
    }, 300)
    return () => clearInterval(interval)
  }, [])
  return (
    <motion.p
      key={loadingText}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'max-content' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="text-sm text-muted-foreground animate-pulse overflow-hidden whitespace-nowrap col-span-full"
    >
      {loadingText}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="animate-pulse"
      >
        {dots}
      </motion.span>
    </motion.p>
  )
}
