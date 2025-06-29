import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingPlanFormData } from '../../../types'

import { SidebarExercsesCard } from './sidebar-exercise-card'

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
    return <SidebarExercsesCard name={activeExercise.name} />
  }

  // Handle dragging day exercises
  const currentWeek = weeks[activeWeek]
  const dayExercise = currentWeek?.days
    .flatMap((d) => d.exercises)
    .find((ex) => ex.id === activeId)

  if (dayExercise) {
    return <SidebarExercsesCard name={dayExercise.name} />
  }

  return null
}
