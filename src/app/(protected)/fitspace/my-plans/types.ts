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
  Plans = 'plans',
}

// Unified plan type for the new design
export type UnifiedPlan = ActivePlan | AvailablePlan | CompletedPlan

// Plan status for badge display
export enum PlanStatus {
  Active = 'active',
  Paused = 'paused',
  Template = 'templates',
  Completed = 'completed',
}

// Helper function to determine plan status
export function getPlanStatus(
  plan: UnifiedPlan,
  isActive: boolean = false,
): PlanStatus {
  if (!plan) return PlanStatus.Template

  // Check if it's a completed plan
  if ('completedAt' in plan && plan.completedAt) {
    return PlanStatus.Completed
  }

  // Check if it's an active plan
  if (isActive || ('active' in plan && plan.active)) {
    return PlanStatus.Active
  }

  // Check if it's paused (has startDate but not currently active and not completed)
  if (
    'startDate' in plan &&
    plan.startDate &&
    !('completedAt' in plan && plan.completedAt)
  ) {
    return PlanStatus.Paused
  }

  // Default to template for available plans
  return PlanStatus.Template
}
