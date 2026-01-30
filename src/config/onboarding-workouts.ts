/**
 * Onboarding Workout Configuration
 *
 * Maps training goals to curated free workouts for the onboarding flow.
 * Users select a goal, then see 2 recommended workouts to start immediately.
 */
import type { CompactWorkoutCardData } from '@/app/(protected)/fitspace/explore/components/free-workouts-tab'
import { GQLDifficulty, GQLWorkoutType } from '@/generated/graphql-client'

import type { VolumeGoalPresetId } from './volume-goals'

export interface OnboardingGoal {
  id: string
  label: string
  description: string
  volumePreset: VolumeGoalPresetId
}

export const ONBOARDING_GOALS: OnboardingGoal[] = [
  {
    id: 'upper-body',
    label: 'Upper Body',
    description: 'Chest, back, shoulders & arms',
    volumePreset: 'upper-body',
  },
  {
    id: 'lower-body',
    label: 'Lower Body & Glutes',
    description: 'Legs, glutes & core',
    volumePreset: 'lower-body',
  },
  {
    id: 'balanced',
    label: 'Balanced (Full Body)',
    description: 'Even development everywhere',
    volumePreset: 'balanced',
  },
] as const

export type OnboardingGoalId = (typeof ONBOARDING_GOALS)[number]['id']

/**
 * Workout data with trainingDayId for starting the workout
 */
export interface OnboardingWorkout extends CompactWorkoutCardData {
  trainingDayId: string
}

/**
 * Pre-configured workouts for onboarding
 * Minimal data extracted from FreeWorkoutDay records
 */
const ONBOARDING_WORKOUTS: Record<string, OnboardingWorkout> = {
  // Upper Body from Upper/Lower Split
  'e0665555-3d0d-475e-813b-bfe9a23c6c46': {
    id: 'e0665555-3d0d-475e-813b-bfe9a23c6c46',
    trainingDayId: '30d74bc2-bf16-4830-bcc6-51ce0c859aa8',
    heroImageUrl:
      'https://d1ahv5z4h61wkv.cloudfront.net/exercises/cmb9qpv2t001kuhbnf4kc3cay/1763312518273-1440_1800-685.webp',
    workoutType: GQLWorkoutType.UpperBody,
    exercisesCount: 6,
    estimatedMinutes: 35,
    planTitle: 'Upper/Lower Split Workout',
    difficulty: GQLDifficulty.Beginner,
  },
  // Push from Push Pull Legs 3-Days
  '4efc7e05-ecd9-4c28-b589-20164d80671f': {
    id: '4efc7e05-ecd9-4c28-b589-20164d80671f',
    trainingDayId: '7cf482a1-b0d5-4165-be54-cc82c20bddb8',
    heroImageUrl:
      'https://d1ahv5z4h61wkv.cloudfront.net/exercises/10bdb05f-d196-4bf7-8968-6df085bffb30/1760982169084-1440_1800-086.webp',
    workoutType: GQLWorkoutType.Push,
    exercisesCount: 6,
    estimatedMinutes: 35,
    planTitle: 'Push Pull Legs 3-Days',
    difficulty: GQLDifficulty.Beginner,
  },
  // Lower Body from Upper/Lower 4-Days
  'd6cb2d58-802d-4824-b78b-164fd949b6f0': {
    id: 'd6cb2d58-802d-4824-b78b-164fd949b6f0',
    trainingDayId: 'bb59efba-15d7-4bfc-9f0f-050d72fb49dd',
    heroImageUrl:
      'https://d1ahv5z4h61wkv.cloudfront.net/exercises/26559bad-a9ac-42c3-9032-58c83e31595d/1760983553122-1440_1800-169.webp',
    workoutType: GQLWorkoutType.LowerBody,
    exercisesCount: 6,
    estimatedMinutes: 40,
    planTitle: 'Upper/Lower 4-Days',
    difficulty: GQLDifficulty.Intermediate,
  },
  // Full Body from 4-Day Full-Body Kickstarter
  '77a0b4eb-0eb3-40bd-8965-9bb92fc28539': {
    id: '77a0b4eb-0eb3-40bd-8965-9bb92fc28539',
    trainingDayId: '3eb784d7-3f70-4452-bb71-a9a45d66e3da',
    heroImageUrl:
      'https://d1ahv5z4h61wkv.cloudfront.net/exercises/cmb9qptfa001duhbn3bse0jfh/1760980270777-1440_1800-050.webp',
    workoutType: GQLWorkoutType.FullBody,
    exercisesCount: 6,
    estimatedMinutes: 35,
    planTitle: '4-Day Full-Body Kickstarter',
    difficulty: GQLDifficulty.Beginner,
  },
  // Dumbbell Full Body from 3-Day Dumbbell Full-Body
  '9c9bbbd4-a109-4947-90e2-8e14ed04daa2': {
    id: '9c9bbbd4-a109-4947-90e2-8e14ed04daa2',
    trainingDayId: '01a82a73-3c22-4124-972f-b863971ce8f4',
    heroImageUrl:
      'https://d1ahv5z4h61wkv.cloudfront.net/exercises/cmb9qq3a2002luhbnag7vdkkx/1760473966357-1440_1800-014.webp',
    workoutType: GQLWorkoutType.FullBody,
    exercisesCount: 7,
    estimatedMinutes: 40,
    planTitle: '3-Day Dumbbell Full-Body',
    difficulty: GQLDifficulty.Beginner,
  },
}

/**
 * Map goal → 2 workout IDs
 */
export const ONBOARDING_WORKOUT_MAP: Record<
  OnboardingGoalId,
  [string, string]
> = {
  'upper-body': [
    'e0665555-3d0d-475e-813b-bfe9a23c6c46', // UpperBody
    '4efc7e05-ecd9-4c28-b589-20164d80671f', // Push
  ],
  'lower-body': [
    'd6cb2d58-802d-4824-b78b-164fd949b6f0', // LowerBody
    '77a0b4eb-0eb3-40bd-8965-9bb92fc28539', // FullBody
  ],
  balanced: [
    '9c9bbbd4-a109-4947-90e2-8e14ed04daa2', // Dumbbell Full-Body
    '77a0b4eb-0eb3-40bd-8965-9bb92fc28539', // FullBody Kickstarter
  ],
}

/** Get workouts for a specific goal (returns workout data, not just IDs) */
export function getOnboardingWorkouts(
  goalId: string,
): [OnboardingWorkout, OnboardingWorkout] | null {
  const ids = ONBOARDING_WORKOUT_MAP[goalId as OnboardingGoalId]
  if (!ids) return null

  const workout1 = ONBOARDING_WORKOUTS[ids[0]]
  const workout2 = ONBOARDING_WORKOUTS[ids[1]]

  if (!workout1 || !workout2) return null
  return [workout1, workout2]
}

/** Get goal config by ID */
export function getOnboardingGoalById(
  goalId: string,
): OnboardingGoal | undefined {
  return ONBOARDING_GOALS.find((g) => g.id === goalId)
}
