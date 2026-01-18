'use client'

import { User, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ClientSurveyModal } from '@/components/client-survey/client-survey-modal'
import { useClientSurvey } from '@/components/client-survey/use-client-survey.hook'
import { ComingSoonCard } from '@/components/coming-soon-card'
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
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'
import { cn } from '@/lib/utils'

import { FeaturedTrainer } from './explore.client'

interface TrainersTabProps {
  initialTrainers?: FeaturedTrainer[]
  initialTrainerId?: string | null
}

export function TrainersTab({
  initialTrainers = [],
  initialTrainerId,
}: TrainersTabProps) {
  const { isTrainerServiceEnabled, isLoading: isAccessLoading } =
    useTrainerServiceAccess()

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

  const { data, isLoading: isTrainersLoading } = useGetFeaturedTrainersQuery(
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

  const trainers = useMemo(() => data?.getFeaturedTrainers || [], [data])
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

  const isLoading = isAccessLoading || isTrainersLoading

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={3} variant="md" />
      </div>
    )
  }

  if (!isTrainerServiceEnabled) {
    return (
      <ComingSoonCard
        title="Trainer Services Coming Soon"
        description="Personal training services are not yet available in your region. We're working to bring this feature to you soon."
        icon={Users}
      />
    )
  }

  return (
    <>
      <div className={cn(trainers.length > 0 && 'space-y-1 -mx-4')}>
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
              onClick={() => handleTrainerClick(trainer)}
              className="rounded-none shadow-none border-y-0 border-sidebar border-x-0"
              classNameImage="rounded-none"
              classNameOverlay="rounded-none"
              classNameBadge="rounded-tr-none"
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
