import {
  GQLExerciseSet,
  GQLTrainingDay,
  GQLTrainingExercise,
  GQLTrainingPlan,
  GQLTrainingWeek,
} from '@/generated/graphql-client'

export type TrainingPlanFormData = {
  details: TrainingDetails
  weeks: TrainingWeek[]
}

export type TrainingDetails = Pick<
  GQLTrainingPlan,
  'title' | 'description' | 'isPublic' | 'isTemplate'
>

export type TrainingWeek = Pick<
  GQLTrainingWeek,
  'weekNumber' | 'name' | 'description' | 'id'
> & {
  days: TrainingDay[]
}

export type TrainingDay = Pick<
  GQLTrainingDay,
  'dayOfWeek' | 'isRestDay' | 'workoutType' | 'id'
> & {
  exercises: TrainingExercise[]
}

export type TrainingExercise = Pick<
  GQLTrainingExercise,
  'name' | 'restSeconds' | 'tempo' | 'instructions' | 'order' | 'id'
> & {
  sets: TrainingSet[]
}

export type TrainingSet = Pick<
  GQLExerciseSet,
  'order' | 'reps' | 'weight' | 'id'
>

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
