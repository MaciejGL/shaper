import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'

export type PlanAction = 'activate' | 'pause' | 'close' | 'delete'
export type AvailablePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['availablePlans'][number]
export type CompletedPlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['completedPlans'][number]
export type ActivePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
export type QuickWorkoutPlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['quickWorkoutPlan']

export enum PlanTab {
  QuickWorkout = 'quick-workout',
  Active = 'active',
  Available = 'available',
  Completed = 'completed',
}
