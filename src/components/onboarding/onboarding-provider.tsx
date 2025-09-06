'use client'

import { OnboardingModal } from './onboarding-modal'
import { useOnboarding } from './use-onboarding.hook'

export function OnboardingProvider() {
  const { isModalOpen, markOnboardingCompleted } = useOnboarding()

  return (
    <OnboardingModal
      open={isModalOpen}
      markOnboardingCompleted={markOnboardingCompleted}
    />
  )
}
