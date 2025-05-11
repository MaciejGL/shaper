import { WorkoutType } from './types'

export const dayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const workoutTypes: WorkoutType[] = [
  WorkoutType.Push,
  WorkoutType.Pull,
  WorkoutType.Legs,
  WorkoutType.UpperBody,
  WorkoutType.LowerBody,
  WorkoutType.FullBody,
  WorkoutType.Cardio,
  WorkoutType.Mobility,
  WorkoutType.Glutes,
]

export const cardioWorkoutTypes: WorkoutType[] = [WorkoutType.Cardio]

export const mobilityWorkoutTypes: WorkoutType[] = [WorkoutType.Mobility]

export const absWorkoutTypes: WorkoutType[] = [WorkoutType.Abs]

export const splitWorkoutTypes: WorkoutType[] = [
  WorkoutType.Back,
  WorkoutType.Arms,
  WorkoutType.Chest,
  WorkoutType.Quads,
  WorkoutType.Hams,
  WorkoutType.Calves,
  WorkoutType.Biceps,
  WorkoutType.Triceps,
  WorkoutType.Glutes,
]
