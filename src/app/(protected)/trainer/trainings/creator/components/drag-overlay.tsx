import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingExercise, TrainingPlanFormData } from '../../../types'

import {
  SidebarExercsesCard,
  TrainingExerciseCard,
} from './sidebar-exercise-card'

interface DragOverlayProps {
  activeId: string | null
  exercises: GQLTrainerExercisesQuery['userExercises'] &
    GQLTrainerExercisesQuery['publicExercises']
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
}

export function DragOverlay({ activeId, exercises, weeks }: DragOverlayProps) {
  if (!activeId) return null

  // Check if it's a sidebar exercise first (regular database ID)
  const activeExercise = exercises.find((ex) => ex.id === activeId)
  if (activeExercise) {
    return <SidebarExercsesCard exercise={activeExercise} />
  }

  // Handle dragging day exercises with stable key format (weekIndex-dayIndex-exerciseIndex)
  const stableKeyParts = activeId.split('-')
  if (stableKeyParts.length >= 3) {
    const [weekIndexStr, dayIndexStr, exerciseIndexStr, exerciseId] =
      stableKeyParts
    const weekIndex = parseInt(weekIndexStr, 10)
    const dayIndex = parseInt(dayIndexStr, 10)
    const exerciseIndex = parseInt(exerciseIndexStr, 10)

    // Find the exercise using the position information
    const targetWeek = weeks[weekIndex]
    const targetDay = targetWeek?.days.find((d) => d.dayOfWeek === dayIndex)
    const dayExercise = targetDay?.exercises[exerciseIndex]

    if (dayExercise) {
      return (
        <TrainingExerciseCard
          key={exerciseId}
          exercise={dayExercise as unknown as TrainingExercise}
        />
      )
    }
  }

  return null
}
