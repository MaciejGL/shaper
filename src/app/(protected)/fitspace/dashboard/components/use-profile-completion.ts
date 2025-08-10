import { useCallback, useMemo } from 'react'

import { GQLProfileQuery } from '@/generated/graphql-client'

export interface ProfileCompletionStep {
  id: string
  label: string
  description: string
  completed: boolean
  href: string
  weight: number
  category: 'essential' | 'important' | 'helpful'
}

// Weighted scoring for profile completion - fitness app priorities
const STEP_DEFINITIONS: Omit<ProfileCompletionStep, 'completed'>[] = [
  {
    id: 'body-measurements',
    label: 'Body measurements',
    description: 'Height and weight for workout planning',
    href: '/fitspace/profile',
    weight: 30,
    category: 'essential',
  },
  {
    id: 'fitness-level',
    label: 'Fitness level',
    description: 'Your current experience level',
    href: '/fitspace/profile',
    weight: 25,
    category: 'essential',
  },
  {
    id: 'basic-info',
    label: 'Basic info',
    description: 'Name and contact information',
    href: '/fitspace/profile',
    weight: 20,
    category: 'important',
  },
  {
    id: 'goals',
    label: 'Fitness goals',
    description: 'What you want to achieve',
    href: '/fitspace/profile',
    weight: 15,
    category: 'important',
  },
  {
    id: 'activity-level',
    label: 'Activity level',
    description: 'Daily activity habits',
    href: '/fitspace/profile',
    weight: 10,
    category: 'helpful',
  },
]

export interface ProfileCompletionResult {
  steps: ProfileCompletionStep[]
  completedSteps: number
  totalSteps: number
  completionPercentage: number
  weightedPercentage: number
  nextIncompleteStep?: ProfileCompletionStep
  isComplete: boolean
  essentialStepsComplete: boolean
  importantStepsComplete: boolean
}

export function useProfileCompletion(
  profile: NonNullable<GQLProfileQuery['profile']> | null | undefined,
): ProfileCompletionResult {
  // Memoized completion checker functions
  const checkBasicInfo = useCallback(
    (profile: NonNullable<GQLProfileQuery['profile']>) => {
      return !!(
        profile.firstName?.trim() &&
        profile.lastName?.trim() &&
        profile.email?.trim()
      )
    },
    [],
  )

  const checkGoals = useCallback(
    (profile: NonNullable<GQLProfileQuery['profile']>) => {
      return !!(
        profile.goals &&
        Array.isArray(profile.goals) &&
        profile.goals.length > 0
      )
    },
    [],
  )

  const checkBodyMeasurements = useCallback(
    (profile: NonNullable<GQLProfileQuery['profile']>) => {
      return !!(
        profile.height &&
        profile.weight &&
        profile.height > 0 &&
        profile.weight > 0
      )
    },
    [],
  )

  const checkFitnessLevel = useCallback(
    (profile: NonNullable<GQLProfileQuery['profile']>) => {
      return !!(profile.fitnessLevel && profile.fitnessLevel.trim())
    },
    [],
  )

  const checkActivityLevel = useCallback(
    (profile: NonNullable<GQLProfileQuery['profile']>) => {
      return !!(profile.activityLevel && profile.activityLevel.trim())
    },
    [],
  )

  // Completion checker map
  const completionCheckers = useMemo(
    () => ({
      'basic-info': checkBasicInfo,
      goals: checkGoals,
      'body-measurements': checkBodyMeasurements,
      'fitness-level': checkFitnessLevel,
      'activity-level': checkActivityLevel,
    }),
    [
      checkBasicInfo,
      checkGoals,
      checkBodyMeasurements,
      checkFitnessLevel,
      checkActivityLevel,
    ],
  )

  // Calculate completion status
  const completionResult = useMemo((): ProfileCompletionResult => {
    if (!profile) {
      // Return empty state if no profile data
      const emptySteps = STEP_DEFINITIONS.map((step) => ({
        ...step,
        completed: false,
      }))

      return {
        steps: emptySteps,
        completedSteps: 0,
        totalSteps: emptySteps.length,
        completionPercentage: 0,
        weightedPercentage: 0,
        nextIncompleteStep: emptySteps[0],
        isComplete: false,
        essentialStepsComplete: false,
        importantStepsComplete: false,
      }
    }

    // Calculate step completion
    const steps = STEP_DEFINITIONS.map((step) => ({
      ...step,
      completed:
        completionCheckers[step.id as keyof typeof completionCheckers]?.(
          profile,
        ) ?? false,
    }))

    const completedSteps = steps.filter((step) => step.completed).length
    const totalSteps = steps.length

    // Simple percentage
    const completionPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Weighted percentage based on importance
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0)
    const completedWeight = steps.reduce(
      (sum, step) => (step.completed ? sum + step.weight : sum),
      0,
    )
    const weightedPercentage =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

    // Find next incomplete step by priority (highest weight first)
    const nextIncompleteStep = steps
      .filter((step) => !step.completed)
      .sort((a, b) => b.weight - a.weight)[0]

    // Check category completion
    const essentialSteps = steps.filter((step) => step.category === 'essential')
    const importantSteps = steps.filter((step) => step.category === 'important')

    const essentialStepsComplete = essentialSteps.every(
      (step) => step.completed,
    )
    const importantStepsComplete = importantSteps.every(
      (step) => step.completed,
    )

    const isComplete = completedSteps === totalSteps

    return {
      steps,
      completedSteps,
      totalSteps,
      completionPercentage,
      weightedPercentage,
      nextIncompleteStep,
      isComplete,
      essentialStepsComplete,
      importantStepsComplete,
    }
  }, [profile, completionCheckers])

  return completionResult
}
