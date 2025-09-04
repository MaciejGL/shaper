'use client'

import { useEffect, useState } from 'react'

import { useProfileQuery } from '@/generated/graphql-client'

export function useOnboarding() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: profile, isLoading } = useProfileQuery()

  useEffect(() => {
    // Only show onboarding if:
    // 1. Profile is loaded
    // 2. User has not completed onboarding
    // 3. Modal is not already open
    if (
      !isLoading &&
      profile?.profile &&
      !profile.profile.hasCompletedOnboarding &&
      !isModalOpen
    ) {
      setIsModalOpen(true)
    }
  }, [isLoading, profile?.profile, isModalOpen])

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return {
    isModalOpen,
    closeModal,
    shouldShowOnboarding:
      !isLoading && profile?.profile && !profile.profile.hasCompletedOnboarding,
  }
}
