import { GQLDifficulty, GQLFocusTag } from '@/generated/graphql-client'

import { PublicTrainingPlan } from '../explore.client'

export interface PlanFinderAnswers {
  goal: string
  experience: string
  daysPerWeek: number
  duration: number
  focusArea?: string
}

export interface ScoredPlan {
  plan: PublicTrainingPlan
  score: number
  matchReasons: string[]
}

const EXPERIENCE_MAP: Record<string, GQLDifficulty[]> = {
  Beginner: [GQLDifficulty.Beginner],
  Intermediate: [GQLDifficulty.Intermediate, GQLDifficulty.Beginner],
  Experienced: [
    GQLDifficulty.Advanced,
    GQLDifficulty.Expert,
    GQLDifficulty.Intermediate,
  ],
}

const GOAL_TAG_MAP: Record<string, GQLFocusTag[]> = {
  'Build muscle': [GQLFocusTag.MuscleBuilding],
  'Get stronger': [GQLFocusTag.Strength, GQLFocusTag.Powerlifting],
  'Lose fat': [
    GQLFocusTag.WeightLoss,
    GQLFocusTag.BodyRecomposition,
    GQLFocusTag.Cardio,
  ],
  'General fitness': [
    GQLFocusTag.FunctionalFitness,
    GQLFocusTag.Endurance,
    GQLFocusTag.Bodyweight,
  ],
}

const DURATION_RANGES = {
  20: [0, 25],
  30: [20, 45],
  50: [40, 65],
  70: [60, 999],
}

export function scorePlans(
  plans: PublicTrainingPlan[],
  answers: PlanFinderAnswers,
): ScoredPlan[] {
  return plans
    .map((plan) => {
      let score = 0
      const matchReasons: string[] = []

      // 1. Experience (Critical)
      // Check if plan difficulty matches user experience
      const allowedDifficulties = EXPERIENCE_MAP[answers.experience] || []
      if (plan.difficulty && allowedDifficulties.includes(plan.difficulty)) {
        score += 30
        if (
          plan.difficulty === GQLDifficulty.Beginner &&
          answers.experience === 'Beginner'
        ) {
          score += 10 // Bonus for exact beginner match
        }
      } else {
        // Penalty for mismatch, especially for beginners
        if (
          answers.experience === 'Beginner' &&
          plan.difficulty !== GQLDifficulty.Beginner
        ) {
          score -= 50
        }
      }

      // 2. Days per week (High impact)
      // Exact match is best, +/- 1 is okay
      const planDays = plan.sessionsPerWeek || 3 // Default to 3 if unknown
      const diffDays = Math.abs(planDays - answers.daysPerWeek)
      if (diffDays === 0) {
        score += 25
        matchReasons.push(`Matches your ${planDays} days/week preference`)
      } else if (diffDays <= 1) {
        score += 10
      } else {
        score -= 20
      }

      // 3. Goal (Focus Tags)
      const targetTags = GOAL_TAG_MAP[answers.goal] || []
      const hasMatchingTag = plan.focusTags?.some((tag) =>
        targetTags.includes(tag),
      )
      if (hasMatchingTag) {
        score += 20
        matchReasons.push(
          `Aligned with your goal to ${answers.goal.toLowerCase()}`,
        )
      }

      // 4. Time per workout
      // Using simple ranges based on answer keys (20, 30, 50, 70 representing the buckets)
      const planDuration = plan.avgSessionTime || 45
      const [min, max] = DURATION_RANGES[
        answers.duration as keyof typeof DURATION_RANGES
      ] || [0, 999]

      if (planDuration >= min && planDuration <= max) {
        score += 15
        matchReasons.push(`Fits your ${planDuration} min timeframe`)
      } else {
        // Closer is better
        if (Math.abs(planDuration - answers.duration) < 15) {
          score += 5
        }
      }

      return {
        plan,
        score,
        matchReasons: matchReasons.slice(0, 2), // Top 2 reasons
      }
    })
    .sort((a, b) => b.score - a.score)
}
