import {
  GQLGetFreeWorkoutDaysQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

export type WorkoutDay =
  GQLGetFreeWorkoutDaysQuery['getFreeWorkoutDays'][number]
export type PublicPlan =
  GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]

export type DrawerView =
  | { type: 'workout'; data: WorkoutDay }
  | { type: 'plan'; data: PublicPlan }
