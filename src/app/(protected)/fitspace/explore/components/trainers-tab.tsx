'use client'

import { User } from 'lucide-react'
import { useState } from 'react'

import { ClientSurveyModal } from '@/components/client-survey/client-survey-modal'
import { useClientSurvey } from '@/components/client-survey/use-client-survey.hook'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { TrainerCard, TrainerData } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Card, CardContent } from '@/components/ui/card'
import {
  GQLGetFeaturedTrainersQuery,
  useCreateCoachingRequestMutation,
  useGetFeaturedTrainersQuery,
} from '@/generated/graphql-client'

type FeaturedTrainer =
  GQLGetFeaturedTrainersQuery['getFeaturedTrainers'][number]

interface TrainersTabProps {
  initialTrainers?: FeaturedTrainer[]
}

export function TrainersTab({ initialTrainers = [] }: TrainersTabProps) {
  const [selectedTrainer, setSelectedTrainer] =
    useState<FeaturedTrainer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [hasRequestedCoaching, setHasRequestedCoaching] = useState(false)

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
  const createCoachingRequestMutation = useCreateCoachingRequestMutation()

  const trainers = data?.getFeaturedTrainers || []

  const handleTrainerClick = (trainer: FeaturedTrainer) => {
    setSelectedTrainer(trainer)
    setIsDrawerOpen(true)
  }

  const handleRequestCoaching = async (trainer: TrainerData) => {
    const trainerName =
      trainer.name ||
      `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
      'Trainer'

    await createCoachingRequestMutation.mutateAsync({
      recipientEmail: trainer.email,
      message: `Hi ${trainerName}, I'm interested in your coaching services. I'd love to discuss how you can help me achieve my fitness goals.`,
    })

    setHasRequestedCoaching(true)
    // Open survey modal after successful request
    openSurvey()
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
        hasRequestedCoaching={hasRequestedCoaching}
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
    </>
  )
}
