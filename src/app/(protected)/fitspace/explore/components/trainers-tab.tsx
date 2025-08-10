'use client'

import { User } from 'lucide-react'
import { useState } from 'react'

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

export function TrainersTab() {
  const [selectedTrainer, setSelectedTrainer] =
    useState<FeaturedTrainer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { data, isLoading } = useGetFeaturedTrainersQuery({ limit: 30 })
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
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">Featured Trainers</h2>
        <p className="text-sm text-muted-foreground">
          Connect with our expert trainers for personalized coaching
        </p>
      </div>

      <div className="space-y-4">
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
              variant="gradient"
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
      />
    </div>
  )
}
