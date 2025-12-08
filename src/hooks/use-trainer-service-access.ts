'use client'

import { useUser } from '@/context/user-context'

import { FEATURE_FLAGS, useFeatureFlag } from './use-feature-flag'

interface TrainerServiceAccess {
  /** Whether the trainers service feature flag is enabled */
  isTrainerServiceEnabled: boolean
  /** Whether the user has an existing trainer relationship */
  hasExistingTrainer: boolean
  /** Whether the user can access trainer features (enabled OR has existing trainer) */
  canAccessTrainerFeatures: boolean
  /** Whether the feature flag is still loading */
  isLoading: boolean
}

/**
 * Hook to determine trainer service access based on feature flag and user's trainer relationship.
 *
 * Logic:
 * - If feature flag is enabled: full access to all trainer features
 * - If feature flag is disabled but user has existing trainer: access to My Trainer & Nutrition
 * - If feature flag is disabled and no existing trainer: show "Coming Soon" states
 */
export function useTrainerServiceAccess(): TrainerServiceAccess {
  const { user, isLoading: isUserLoading } = useUser()
  const { isEnabled: isTrainerServiceEnabled, isLoading: isFlagLoading } =
    useFeatureFlag(FEATURE_FLAGS.trainersService)

  const hasExistingTrainer = Boolean(user?.trainerId)
  const canAccessTrainerFeatures = isTrainerServiceEnabled || hasExistingTrainer

  return {
    isTrainerServiceEnabled,
    hasExistingTrainer,
    canAccessTrainerFeatures,
    isLoading: isUserLoading || isFlagLoading,
  }
}
