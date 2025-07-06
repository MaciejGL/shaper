import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'

export type PlanAction = 'activate' | 'pause' | 'close' | 'delete'
export type AvailablePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['availablePlans'][number]
export type CompletedPlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['completedPlans'][number]
export type ActivePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['activePlan']
export type QuickWorkoutPlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['quickWorkoutPlan']

export enum PlanTab {
  QuickWorkout = 'quick-workout',
  Active = 'active',
  Available = 'available',
  Completed = 'completed',
}
