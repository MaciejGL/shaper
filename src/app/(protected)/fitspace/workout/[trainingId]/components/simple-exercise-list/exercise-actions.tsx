import { InfoIcon, Replace } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { VideoPreview } from '@/components/video-preview'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'

import { ExerciseNotebook } from './exercise-notebook'

interface ExerciseActionsProps {
  exercise: WorkoutContextPlan['weeks'][number]['days'][number]['exercises'][number]
  handleToggleSet: (setId: string, completed: boolean) => void
  onShowInstructions: () => void
  onShowSwapExercise: () => void
}

export function ExerciseActions({
  exercise,
  handleToggleSet,
  onShowInstructions,
  onShowSwapExercise,
}: ExerciseActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-2">
      {exercise.restSeconds && (
        <CountdownTimer
          restDuration={exercise.restSeconds}
          variant="tertiary"
          onComplete={() => {
            // Find the first uncompleted set and mark it as done
            const firstUncompletedSet = exercise.sets.find(
              (set) => !set.completedAt,
            )
            if (firstUncompletedSet) {
              handleToggleSet(firstUncompletedSet.id, true)
            }
          }}
        />
      )}

      <div className="flex items-center gap-2">
        {exercise.videoUrl && (
          <VideoPreview
            url={exercise.videoUrl}
            variant="tertiary"
            size="icon-md"
          />
        )}

        <ExerciseNotebook exercise={exercise} variant="tertiary" />

        {exercise.substitutes.length > 0 && (
          <Button
            variant="tertiary"
            onClick={onShowSwapExercise}
            iconOnly={<Replace />}
          />
        )}

        {(exercise.instructions || exercise.additionalInstructions) && (
          <Button
            variant="tertiary"
            onClick={onShowInstructions}
            iconOnly={<InfoIcon />}
          />
        )}
      </div>
    </div>
  )
}
