'use client'

import { useState } from 'react'

import { ClientSurveyData } from './types'

export function useClientSurvey() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const openSurvey = () => {
    setIsModalOpen(true)
  }

  const closeSurvey = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (data: ClientSurveyData) => {
    // TODO: Implement API call to save survey data
    // This will be connected to GraphQL mutation in later phase
    // eslint-disable-next-line no-console
    console.log('Survey submitted:', data)

    setIsCompleted(true)
    closeSurvey()
  }

  return {
    isModalOpen,
    isCompleted,
    openSurvey,
    closeSurvey,
    handleSubmit,
  }
}
