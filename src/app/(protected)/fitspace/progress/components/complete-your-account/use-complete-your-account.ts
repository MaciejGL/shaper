import {
  useBodyMeasuresQuery,
  useCurrentVolumeGoalQuery,
  useProfileQuery,
} from '@/generated/graphql-client'
import { useUser } from '@/context/user-context'

import type {
  CompleteYourAccountState,
  CompleteYourAccountStepId,
} from './types'

interface UseCompleteYourAccountOptions {
  enabled?: boolean
}

const TOTAL_COUNT = 6

export function useCompleteYourAccount(
  options: UseCompleteYourAccountOptions = {},
): CompleteYourAccountState {
  const { user } = useUser()
  const enabled = options.enabled ?? true

  const isEnabled = enabled && !!user?.id

  const { data: profileData, isLoading: isLoadingProfile } = useProfileQuery(
    undefined,
    { enabled: isEnabled, staleTime: 60_000 },
  )

  const { data: goalData, isLoading: isLoadingGoal } = useCurrentVolumeGoalQuery(
    {},
    { enabled: isEnabled, staleTime: 60_000 },
  )

  const profile = profileData?.profile ?? null
  const currentVolumeGoal = goalData?.profile?.currentVolumeGoal ?? null

  const hasName = Boolean(profile?.firstName?.trim() && profile?.lastName?.trim())
  const hasSex = Boolean(profile?.sex)
  const hasBirthday = Boolean(profile?.birthday)
  const hasHeight = typeof profile?.height === 'number' && profile.height > 0

  const hasWeightInProfile =
    typeof profile?.weight === 'number' && profile.weight > 0

  const shouldFetchMeasures = isEnabled && !hasWeightInProfile
  const { data: bodyMeasuresData, isLoading: isLoadingMeasures } =
    useBodyMeasuresQuery(undefined, {
      enabled: shouldFetchMeasures,
      staleTime: 5 * 60_000,
    })

  const hasWeightInMeasures =
    bodyMeasuresData?.bodyMeasures?.some((m) => {
      return typeof m.weight === 'number' && m.weight > 0
    }) ?? false

  const hasWeight = hasWeightInProfile || hasWeightInMeasures
  const hasVolumeGoal = Boolean(currentVolumeGoal?.id)

  const isLoading =
    !isEnabled || isLoadingProfile || isLoadingGoal || isLoadingMeasures

  if (isLoading) {
    return {
      isLoading: true,
      isComplete: false,
      completedCount: 0,
      totalCount: TOTAL_COUNT,
      missingSteps: [],
      nextStep: null,
    }
  }

  const missingSteps: CompleteYourAccountStepId[] = []

  if (!hasName) missingSteps.push('name')
  if (!hasSex) missingSteps.push('sex')
  if (!hasBirthday) missingSteps.push('birthday')
  if (!hasHeight) missingSteps.push('height')
  if (!hasWeight) missingSteps.push('weight')
  if (!hasVolumeGoal) missingSteps.push('volumeGoal')

  const completedCount = TOTAL_COUNT - missingSteps.length
  const nextStep = missingSteps[0] ?? null

  return {
    isLoading: false,
    isComplete: missingSteps.length === 0,
    completedCount,
    totalCount: TOTAL_COUNT,
    missingSteps,
    nextStep,
  }
}

