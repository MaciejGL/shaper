import { CheckIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutQuery,
  useFitspaceSwapExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseActions } from './exercise-actions'
import { ExerciseMetadata } from './exercise-metadata'
import { ExerciseSets } from './exercise-sets'
import { InstructionsDrawer } from './instructions-drawer'
import { SwapExerciseDrawer } from './swap-exercise-drawer'

interface SimpleExerciseProps {
  exercise: WorkoutContextPlan['weeks'][number]['days'][number]['exercises'][number]
  handleToggleExercise: (exerciseId: string, completed: boolean) => void
  completingExercises: Set<string>
  handleToggleSet: (setId: string, completed: boolean) => void
  completingSets: Set<string>
}

export function SimpleExercise({
  exercise,
  handleToggleExercise,
  completingExercises,
  handleToggleSet,
  completingSets,
}: SimpleExerciseProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()
  const isCompleted = Boolean(exercise.completedAt)
  const isLoading = completingExercises.has(exercise.id)

  // State for modals/drawers
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false)
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<
    string | null
  >(null)

  const { mutateAsync: swapExercise, isPending: isSwapping } =
    useFitspaceSwapExerciseMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const handleSwapExercise = async () => {
    if (!selectedSubstituteId) return

    await swapExercise({
      exerciseId: exercise.id,
      substituteId: selectedSubstituteId,
    })
    setIsSwapExerciseOpen(false)
    setSelectedSubstituteId(null)
  }

  return (
    <>
      <Card key={exercise.id}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">
                  {exercise.order}. {exercise.name}
                </CardTitle>
                <Button
                  variant="tertiary"
                  iconOnly={
                    <CheckIcon
                      className={cn(isCompleted && 'text-green-600')}
                    />
                  }
                  loading={isLoading}
                  onClick={() =>
                    handleToggleExercise(exercise.id, !isCompleted)
                  }
                  className="self-start"
                />
              </div>

              <ExerciseActions
                exercise={exercise}
                handleToggleSet={handleToggleSet}
                onShowInstructions={() => setIsInstructionsOpen(true)}
                onShowSwapExercise={() => setIsSwapExerciseOpen(true)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {exercise.additionalInstructions && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <p className="whitespace-pre-wrap">
                {exercise.additionalInstructions}
              </p>
            </div>
          )}

          <ExerciseMetadata exercise={exercise} />

          <ExerciseSets
            exercise={exercise}
            handleToggleSet={handleToggleSet}
            completingSets={completingSets}
          />

          {/* Instructions preview */}
        </CardContent>
      </Card>

      <InstructionsDrawer
        exercise={exercise}
        isOpen={isInstructionsOpen}
        onOpenChange={setIsInstructionsOpen}
      />

      <SwapExerciseDrawer
        exercise={exercise}
        isOpen={isSwapExerciseOpen}
        onOpenChange={setIsSwapExerciseOpen}
        selectedSubstituteId={selectedSubstituteId}
        onSelectedSubstituteIdChange={setSelectedSubstituteId}
        onSwap={handleSwapExercise}
        isSwapping={isSwapping}
      />
    </>
  )
}
