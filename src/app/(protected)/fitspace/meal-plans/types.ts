import { GQLFitspaceMealPlansOverviewQuery } from '@/generated/graphql-client'

export type MealPlanOverview =
  GQLFitspaceMealPlansOverviewQuery['getMyMealPlansOverview']

export type ActiveMealPlan = NonNullable<MealPlanOverview>['activePlan']

export type AvailableMealPlan =
  NonNullable<MealPlanOverview>['availablePlans'][number]

export type MealPlanAction = 'activate' | 'deactivate' | 'delete'

export enum MealPlanTab {
  Active = 'active',
  Available = 'available',
}
