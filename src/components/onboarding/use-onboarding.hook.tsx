'use client'

import { useEffect, useState } from 'react'

import { useUser } from '@/context/user-context'

export function useOnboarding() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const { user, session } = useUser()

  useEffect(() => {
    // Only show onboarding if:
    // 1. User is authenticated and loaded
    // 2. User has not completed onboarding (either in cache or locally)
    // 3. Modal is not already open
    // 4. We haven't locally marked it as completed
    if (
      session.status === 'authenticated' &&
      user?.profile &&
      !user.profile.hasCompletedOnboarding &&
      !hasCompletedOnboarding &&
      !isModalOpen
    ) {
      setIsModalOpen(true)
    }
  }, [session.status, user?.profile, hasCompletedOnboarding, isModalOpen])

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const markOnboardingCompleted = () => {
    // Immediately mark as completed locally to prevent reopening
    setHasCompletedOnboarding(true)
    setIsModalOpen(false)
  }

  return {
    isModalOpen,
    closeModal,
    markOnboardingCompleted,
    shouldShowOnboarding:
      session.status === 'authenticated' &&
      user?.profile &&
      !user.profile.hasCompletedOnboarding &&
      !hasCompletedOnboarding,
  }
}
