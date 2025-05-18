import { GQLWorkoutType } from '@/generated/graphql-client'

export type TrainingPlanFormData = {
  details: TrainingDetails
  weeks: TrainingWeek[]
}

export type TrainingDetails = {
  title: string
  description?: string
  isPublic?: boolean
  isTemplate?: boolean
}

export type TrainingWeek = {
  weekNumber: number
  name: string
  description: string
  days: TrainingDay[]
}

export type TrainingDay = {
  dayOfWeek: number
  isRestDay: boolean
  workoutType?: GQLWorkoutType
  exercises: TrainingExercise[]
}

export type TrainingExercise = {
  name: string
  sets: TrainingSet[]
  restSeconds: number
  tempo?: string
  instructions?: string
  order: number
}

export type TrainingSet = {
  order: number
  reps: number
  weight: number
}

export enum WorkoutType {
  Push = 'Push',
  Pull = 'Pull',
  Legs = 'Legs',
  UpperBody = 'Upper Body',
  LowerBody = 'Lower Body',
  FullBody = 'Full Body',
  Cardio = 'Cardio',
  Mobility = 'Mobility',
  // Split
  Back = 'Back',
  Arms = 'Arms',
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Quads = 'Quads',
  Hams = 'Hams',
  Calves = 'Calves',
  Glutes = 'Glutes',
  Abs = 'Abs',
  Chest = 'Chest',

  Custom = 'Custom',
}
