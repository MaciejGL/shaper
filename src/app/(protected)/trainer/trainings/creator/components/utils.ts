import { GQLWorkoutType } from '@/generated/graphql-client'

export const dayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export type WorkoutTypeGroup = {
  label: string
  types: GQLWorkoutType[]
}

export const workoutTypeGroups: WorkoutTypeGroup[] = [
  {
    label: 'Classic',
    types: [
      GQLWorkoutType.FullBody,
      GQLWorkoutType.UpperBody,
      GQLWorkoutType.LowerBody,
      GQLWorkoutType.Push,
      GQLWorkoutType.Pull,
      GQLWorkoutType.Legs,
    ],
  },
  {
    label: 'Split',
    types: [
      GQLWorkoutType.Back,
      GQLWorkoutType.Arms,
      GQLWorkoutType.Chest,
      GQLWorkoutType.Quads,
      GQLWorkoutType.Hams,
      GQLWorkoutType.Calves,
      GQLWorkoutType.Biceps,
      GQLWorkoutType.Triceps,
      GQLWorkoutType.Glutes,
    ],
  },
  {
    label: 'Cardio',
    types: [GQLWorkoutType.Cardio, GQLWorkoutType.Liss, GQLWorkoutType.Hiit],
  },
  {
    label: 'Mobility',
    types: [GQLWorkoutType.Mobility, GQLWorkoutType.Stretching],
  },
  {
    label: 'Core',
    types: [GQLWorkoutType.Abs, GQLWorkoutType.Core],
  },
  {
    label: 'Other',
    types: [GQLWorkoutType.Custom],
  },
]
