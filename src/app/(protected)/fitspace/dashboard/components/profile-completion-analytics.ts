import { ProfileCompletionResult } from './use-profile-completion'

export interface ProfileCompletionAnalytics {
  // Completion insights
  completionLevel: 'getting-started' | 'basic' | 'good' | 'excellent'
  blockers: string[]
  recommendations: string[]

  // Progress insights
  canStartWorkouts: boolean
  canTrackNutrition: boolean
  canTrackProgress: boolean

  // Personalization readiness
  personalizationScore: number // 0-100
  readyForRecommendations: boolean
}

export function analyzeProfileCompletion(
  completion: ProfileCompletionResult,
): ProfileCompletionAnalytics {
  const {
    weightedPercentage,
    steps,
    essentialStepsComplete,
    importantStepsComplete,
  } = completion

  // Determine completion level - simplified
  let completionLevel: ProfileCompletionAnalytics['completionLevel'] =
    'getting-started'
  if (weightedPercentage >= 80) completionLevel = 'excellent'
  else if (weightedPercentage >= 55) completionLevel = 'good'
  else if (weightedPercentage >= 30) completionLevel = 'basic'

  // Identify blockers (missing essential/important steps)
  const blockers: string[] = []
  const missingBasicInfo = !steps.find((s) => s.id === 'basic-info')?.completed
  const missingGoals = !steps.find((s) => s.id === 'goals')?.completed
  const missingMeasurements = !steps.find((s) => s.id === 'body-measurements')
    ?.completed
  const missingFitnessLevel = !steps.find((s) => s.id === 'fitness-level')
    ?.completed

  if (missingBasicInfo) {
    blockers.push('Complete your basic profile information to get started')
  }
  if (missingGoals) {
    blockers.push('Set your fitness goals for personalized recommendations')
  }
  if (missingMeasurements) {
    blockers.push(
      'Add body measurements for accurate workout and nutrition planning',
    )
  }
  if (missingFitnessLevel) {
    blockers.push(
      'Specify your fitness level for appropriate workout difficulty',
    )
  }

  // Generate recommendations
  const recommendations: string[] = []

  if (completionLevel === 'getting-started') {
    recommendations.push(
      'Start with basic info and goals to unlock key features',
    )
  }
  if (completionLevel === 'basic') {
    recommendations.push('Add body measurements to enable progress tracking')
    recommendations.push(
      'Set your fitness level for better workout recommendations',
    )
  }
  if (completionLevel === 'good') {
    recommendations.push(
      'Complete all fields for the best personalized experience',
    )
  }

  // Capability assessments - fitness app focused
  const canStartWorkouts =
    steps.find((s) => s.id === 'body-measurements')?.completed ?? false
  const canTrackNutrition =
    steps.find((s) => s.id === 'body-measurements')?.completed ?? false
  const canTrackProgress =
    steps.find((s) => s.id === 'body-measurements')?.completed ?? false

  // Personalization scoring
  let personalizationScore = 0
  if (essentialStepsComplete) personalizationScore += 50
  if (importantStepsComplete) personalizationScore += 30
  if (completion.isComplete) personalizationScore += 20

  const readyForRecommendations =
    essentialStepsComplete && personalizationScore >= 70

  return {
    completionLevel,
    blockers,
    recommendations,
    canStartWorkouts,
    canTrackNutrition,
    canTrackProgress,
    personalizationScore,
    readyForRecommendations,
  }
}
