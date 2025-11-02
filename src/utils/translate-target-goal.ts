import { GQLTargetGoal } from '@/generated/graphql-client'

export function translateTargetGoal(goal: GQLTargetGoal): string {
  switch (goal) {
    case GQLTargetGoal.LoseWeight:
      return 'Lose Weight'
    case GQLTargetGoal.GainMuscle:
      return 'Gain Muscle'
    case GQLTargetGoal.ImproveStrength:
      return 'Improve Strength'
    case GQLTargetGoal.IncreaseEndurance:
      return 'Increase Endurance'
    case GQLTargetGoal.ImproveFlexibility:
      return 'Improve Flexibility'
    case GQLTargetGoal.BodyRecomposition:
      return 'Body Recomposition'
    case GQLTargetGoal.AthleticPerformance:
      return 'Athletic Performance'
    case GQLTargetGoal.GeneralFitness:
      return 'General Fitness'
    case GQLTargetGoal.PowerliftingCompetition:
      return 'Powerlifting Competition'
    case GQLTargetGoal.MarathonTraining:
      return 'Marathon Training'
    case GQLTargetGoal.FunctionalMovement:
      return 'Functional Movement'
    case GQLTargetGoal.InjuryRecovery:
      return 'Injury Recovery'
    case GQLTargetGoal.ImprovePosture:
      return 'Improve Posture'
    case GQLTargetGoal.StressRelief:
      return 'Stress Relief'
    case GQLTargetGoal.ImproveSleep:
      return 'Improve Sleep'
    default:
      return goal
  }
}
