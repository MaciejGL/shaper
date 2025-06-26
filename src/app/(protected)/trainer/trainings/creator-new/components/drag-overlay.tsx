import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../../creator/components/types'

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
      <Card className="p-0">
        <CardContent className="p-2">
          <div className="font-medium text-sm space-y-1">
            <p>{activeExercise.name}</p>
            <Badge variant="secondary">
              {activeExercise.isPublic ? 'Public' : 'Private'}
            </Badge>
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
      <Card className="p-0">
        <CardContent className="p-2">
          <div className="font-medium text-sm space-y-1">
            <p>{dayExercise.name}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
