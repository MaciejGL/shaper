import { formatDate } from 'date-fns'

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
export function getDayName(
  dayOfWeek: number,
  options: {
    short?: boolean
  } = {},
): string {
  // Create a date for Monday (1) and add days to get to target day
  const date = new Date()
  const currentDay = date.getDay() // 0-6 (Sunday-Saturday)

  date.setDate(date.getDate() - currentDay + 1) // Set to Monday
  date.setDate(date.getDate() + dayOfWeek) // Add days to get to target day
  return formatDate(date, options.short ? 'EEE' : 'EEEE')
}

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
