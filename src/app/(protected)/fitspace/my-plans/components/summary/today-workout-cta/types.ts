import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'

type ActivePlan = NonNullable<
  GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
>

export type PlanWeek = ActivePlan['weeks'][number]
export type PlanDay = PlanWeek['days'][number]
export type PlanExercise = PlanDay['exercises'][number]

export interface TodayWorkoutCtaProps {
  weeks: PlanWeek[]
  startDate: string | null
}

export interface TodayWorkoutResult {
  day: PlanDay | null
  nextWorkoutDay: PlanDay | null
}

