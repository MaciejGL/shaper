import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'

export type PlanAction = 'activate' | 'pause' | 'close' | 'delete'
export type AvailablePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['availablePlans'][number]
export type CompletedPlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['completedPlans'][number]
export type ActivePlan =
  GQLFitspaceMyPlansQuery['getMyPlansOverview']['activePlan']
export type WorkoutNavigation = NonNullable<
  NonNullable<GQLFitspaceMyPlansQuery['getWorkout']>['navigation']
>

export enum PlanTab {
  Active = 'active',
  Available = 'available',
  Completed = 'completed',
}
