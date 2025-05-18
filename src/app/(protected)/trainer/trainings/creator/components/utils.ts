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

export const workoutTypes: GQLWorkoutType[] = [
  GQLWorkoutType.Push,
  GQLWorkoutType.Pull,
  GQLWorkoutType.Legs,
  GQLWorkoutType.UpperBody,
  GQLWorkoutType.LowerBody,
  GQLWorkoutType.FullBody,
  GQLWorkoutType.Cardio,
  GQLWorkoutType.Mobility,
  GQLWorkoutType.Glutes,
]

export const cardioWorkoutTypes: GQLWorkoutType[] = [GQLWorkoutType.Cardio]

export const mobilityWorkoutTypes: GQLWorkoutType[] = [GQLWorkoutType.Mobility]

export const absWorkoutTypes: GQLWorkoutType[] = [GQLWorkoutType.Abs]

export const splitWorkoutTypes: GQLWorkoutType[] = [
  GQLWorkoutType.Back,
  GQLWorkoutType.Arms,
  GQLWorkoutType.Chest,
  GQLWorkoutType.Quads,
  GQLWorkoutType.Hams,
  GQLWorkoutType.Calves,
  GQLWorkoutType.Biceps,
  GQLWorkoutType.Triceps,
  GQLWorkoutType.Glutes,
]
