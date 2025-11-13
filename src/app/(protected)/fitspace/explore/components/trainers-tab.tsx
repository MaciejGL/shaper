'use client'

import { User } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ClientSurveyModal } from '@/components/client-survey/client-survey-modal'
import { useClientSurvey } from '@/components/client-survey/use-client-survey.hook'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { ServiceInterestSelector } from '@/components/service-interest-selector/service-interest-selector'
import { TrainerCard, TrainerData } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Card, CardContent } from '@/components/ui/card'
import {
  useCancelCoachingRequestMutation,
  useCreateCoachingRequestMutation,
  useGetFeaturedTrainersQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'

import { FeaturedTrainer } from './explore.client'

interface TrainersTabProps {
  initialTrainers?: FeaturedTrainer[]
  initialTrainerId?: string | null
}

export function TrainersTab({
  initialTrainers = [],
  initialTrainerId,
}: TrainersTabProps) {
  const [selectedTrainer, setSelectedTrainer] =
    useState<FeaturedTrainer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [trainerForRequest, setTrainerForRequest] =
    useState<TrainerData | null>(null)

  const {
    isModalOpen,
    isCompleted,
    existingSurvey,
    openSurvey,
    closeSurvey,
    handleSubmit,
    isSubmitting,
  } = useClientSurvey()

  const { data, isLoading } = useGetFeaturedTrainersQuery(
    { limit: 30 },
    {
      initialData:
        initialTrainers.length > 0
          ? { getFeaturedTrainers: initialTrainers }
          : undefined,
      staleTime: 5 * 60 * 1000, // 5 minutes - match ISR revalidation
    },
  )

  const { data: coachingRequestsData, refetch: refetchCoachingRequests } =
    useMyCoachingRequestsQuery()

  const createCoachingRequestMutation = useCreateCoachingRequestMutation()
  const cancelCoachingRequestMutation = useCancelCoachingRequestMutation()

  const trainers = data?.getFeaturedTrainers || []
  const coachingRequests = coachingRequestsData?.coachingRequests || []

  // Helper to get latest request between current user and another user
  const getLatestRequestWithUser = (userId: string) => {
    const requestsWithUser = coachingRequests.filter(
      (req) => req.recipient.id === userId || req.sender.id === userId,
    )
    // Sort by createdAt descending to get the most recent
    return requestsWithUser.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]
  }

  // Find latest request for the selected trainer
  const latestRequestForSelectedTrainer = selectedTrainer
    ? getLatestRequestWithUser(selectedTrainer.id)
    : null

  // Check if there's a pending request for the selected trainer
  const pendingRequestForSelectedTrainer =
    latestRequestForSelectedTrainer?.status === 'PENDING'
      ? latestRequestForSelectedTrainer
      : null

  const handleTrainerClick = (trainer: FeaturedTrainer) => {
    setSelectedTrainer(trainer)
    setIsDrawerOpen(true)
  }

  useEffect(() => {
    if (initialTrainerId && trainers.length > 0) {
      const trainer = trainers.find((t) => t.id === initialTrainerId)
      if (trainer) {
        setSelectedTrainer(trainer)
        setIsDrawerOpen(true)
      }
    }
  }, [initialTrainerId, trainers])

  const handleRequestCoaching = async (trainer: TrainerData) => {
    setTrainerForRequest(trainer)
    setShowServiceSelector(true)
    setIsDrawerOpen(false)
  }

  const handleConfirmRequest = async (interests: string[], message: string) => {
    if (!trainerForRequest) return

    await createCoachingRequestMutation.mutateAsync({
      recipientEmail: trainerForRequest.email,
      message,
      interestedServices: interests.length > 0 ? interests : undefined,
    })

    // Refetch coaching requests to update the banner
    await refetchCoachingRequests()

    setShowServiceSelector(false)
    setTrainerForRequest(null)

    // Reopen the drawer to show updated state
    setIsDrawerOpen(true)

    // Open survey modal after successful request
    openSurvey()
  }

  const handleWithdrawRequest = async () => {
    if (!pendingRequestForSelectedTrainer) return

    await cancelCoachingRequestMutation.mutateAsync({
      id: pendingRequestForSelectedTrainer.id,
    })

    // Refetch coaching requests to update the UI
    await refetchCoachingRequests()
  }

  const handleCompleteSurvey = () => {
    openSurvey()
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={3} variant="md" />
      </div>
    )
  }
  return (
    <>
      <div className="space-y-3">
        {trainers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No featured trainers available at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          trainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              showClientCount={false}
              onClick={() => handleTrainerClick(trainer)}
            />
          ))
        )}
      </div>

      <TrainerDetailsDrawer
        trainer={selectedTrainer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        showRequestCoaching={true}
        onRequestCoaching={handleRequestCoaching}
        hasRequestedCoaching={!!pendingRequestForSelectedTrainer}
        onWithdrawRequest={handleWithdrawRequest}
        isWithdrawing={cancelCoachingRequestMutation.isPending}
        showCompleteSurvey={!isCompleted}
        onCompleteSurvey={handleCompleteSurvey}
        showRetakeAssessment={isCompleted}
        onRetakeAssessment={handleCompleteSurvey}
      />

      <ClientSurveyModal
        open={isModalOpen}
        onClose={closeSurvey}
        onSubmit={handleSubmit}
        existingSurvey={existingSurvey}
        isSubmitting={isSubmitting}
      />

      {trainerForRequest && (
        <ServiceInterestSelector
          open={showServiceSelector}
          onOpenChange={setShowServiceSelector}
          onConfirm={handleConfirmRequest}
          trainerName={
            trainerForRequest.name ||
            `${trainerForRequest.profile?.firstName || ''} ${trainerForRequest.profile?.lastName || ''}`.trim() ||
            'Trainer'
          }
          isLoading={createCoachingRequestMutation.isPending}
        />
      )}
    </>
  )
}
