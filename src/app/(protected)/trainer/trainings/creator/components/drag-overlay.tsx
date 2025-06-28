import { Card, CardContent } from '@/components/ui/card'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../../creator-old/components/types'

interface DragOverlayProps {
  activeId: string | null
  exercises: GQLTrainerExercisesQuery['userExercises'] &
    GQLTrainerExercisesQuery['publicExercises']
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
}

export function DragOverlay({
  activeId,
  exercises,
  weeks,
  activeWeek,
}: DragOverlayProps) {
  if (!activeId) return null

  const activeExercise = exercises.find((ex) => ex.id === activeId)

  if (activeExercise) {
    return (
      <Card
        className="cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out min-h-[120px]"
        hoverable
      >
        <CardContent className="p-2">
          <div className="font-medium text-sm space-y-1">
            <p>{activeExercise.name}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle dragging day exercises
  const currentWeek = weeks[activeWeek]
  const dayExercise = currentWeek?.days
    .flatMap((d) => d.exercises)
    .find((ex) => ex.id === activeId)

  if (dayExercise) {
    return (
      <Card
        className="cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out min-h-[120px]"
        hoverable
      >
        <CardContent className="p-3 flex items-center justify-between">
          <p className="text-sm font-medium pr-6">{dayExercise.name}</p>
        </CardContent>
      </Card>
    )
  }

  return null
}
