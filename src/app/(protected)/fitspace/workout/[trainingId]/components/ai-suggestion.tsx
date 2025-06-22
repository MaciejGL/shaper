import { AnimatePresence, motion } from 'framer-motion'
import { Check, PlusIcon, SparklesIcon } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VideoPreview } from '@/components/video-preview'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetAiExerciseSuggestionsMutation,
  useFitspaceAddAiExerciseToWorkoutMutation,
  useFitspaceGetAiExerciseSuggestionsMutation,
  useFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
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
  const { activeDay, plan } = useWorkout()
  const invalidateQueries = useInvalidateQuery()
  const {
    mutateAsync: getAiExerciseSuggestions,
    isPending: isGettingAiExerciseSuggestion,
    data: aiExerciseSuggestion,
  } = useFitspaceGetAiExerciseSuggestionsMutation()

  const {
    mutateAsync: addAiExerciseToWorkout,
    isPending: isAddingAiExerciseToWorkout,
  } = useFitspaceAddAiExerciseToWorkoutMutation({
    onSuccess: async () => {
      if (!plan?.id) return
      await invalidateQueries({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId: plan.id }),
      })
    },
  })

  const aiResults = aiExerciseSuggestion?.getAiExerciseSuggestions

  const handleAddAiExerciseToWorkout = async (exerciseId: string) => {
    if (!activeDay?.id || !aiResults) return
    const aiResult = aiResults.find(
      (result) => result.exercise.id === exerciseId,
    )
    if (!aiResult) return
    await addAiExerciseToWorkout({
      input: {
        dayId: activeDay.id,
        exerciseId: exerciseId,
        sets: aiResult.sets.map((set) => ({
          reps: set?.reps ?? 0,
          rpe: set?.rpe,
        })),
      },
    })
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          variant="secondary"
          iconStart={<SparklesIcon className="text-amber-500" />}
          loading={isGettingAiExerciseSuggestion}
          disabled={!activeDay?.id}
          onClick={() =>
            activeDay?.id && getAiExerciseSuggestions({ dayId: activeDay.id })
          }
          className="grow w-full"
        >
          Get suggestions
        </Button>
      </div>
      <AnimatePresence>
        {isGettingAiExerciseSuggestion && <AiLoadingText />}
        {aiResults &&
          aiResults.map((aiResult) => (
            <AiSuggestionItem
              key={aiResult.exercise.id}
              aiResult={aiResult}
              isLoading={isAddingAiExerciseToWorkout}
              handleAddAiExerciseToWorkout={handleAddAiExerciseToWorkout}
            />
          ))}
      </AnimatePresence>
    </>
  )
}

function AiSuggestionItem({
  aiResult,
  isLoading,
  handleAddAiExerciseToWorkout,
}: {
  aiResult: GQLFitspaceGetAiExerciseSuggestionsMutation['getAiExerciseSuggestions'][number]
  isLoading: boolean
  handleAddAiExerciseToWorkout: (exerciseId: string) => void
}) {
  const { activeDay } = useWorkout()

  const isAdded = activeDay?.exercises.some(
    (exercise) => exercise.name === aiResult.exercise.name,
  )
  return (
    <motion.div
      key={aiResult.exercise.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="shadow-neuromorphic-dark-secondary p-4 pb-0 rounded-lg space-y-4 col-span-full"
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
        <div className="grid grid-cols-[50px_80px_80px] gap-2 text-center bg-black/10 -mx-4 p-2">
          <p className="text-muted-foreground text-sm"></p>
          <p className="text-muted-foreground text-sm">Reps</p>
          <p className="text-muted-foreground text-sm">RPE</p>
          {aiResult.sets.map((set, index) => (
            <Fragment key={`${index}-${set?.reps}-${set?.rpe}`}>
              <p className="text-muted-foreground text-sm">Set {index + 1}.</p>
              <p>{set?.reps}</p>
              <p>{set?.rpe}</p>
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
