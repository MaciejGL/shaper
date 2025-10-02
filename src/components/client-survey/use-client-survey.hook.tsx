'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  useGetMyClientSurveyQuery,
  useUpsertClientSurveyMutation,
} from '@/generated/graphql-client'

import { ClientSurveyData } from './types'

export function useClientSurvey() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch existing survey if any
  const { data: existingSurvey } = useGetMyClientSurveyQuery(
    {},
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const upsertMutation = useUpsertClientSurveyMutation({
    onSuccess: () => {
      toast.success('Survey saved successfully!')
      // Invalidate to refetch
      queryClient.invalidateQueries({
        queryKey: useGetMyClientSurveyQuery.getKey(),
      })
    },
    onError: (error: Error) => {
      console.error('Error saving survey:', error)
      toast.error('Failed to save survey. Please try again.')
    },
  })

  const isCompleted = Boolean(existingSurvey?.getMyClientSurvey)
  const surveyData = existingSurvey?.getMyClientSurvey?.data as
    | ClientSurveyData
    | undefined

  const openSurvey = () => {
    setIsModalOpen(true)
  }

  const closeSurvey = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (data: ClientSurveyData) => {
    await upsertMutation.mutateAsync({ data })
    closeSurvey()
  }

  return {
    isModalOpen,
    isCompleted,
    existingSurvey: surveyData,
    openSurvey,
    closeSurvey,
    handleSubmit,
    isSubmitting: upsertMutation.isPending,
  }
}
