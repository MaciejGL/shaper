'use client'

import { CheckCircle, Mail, MessageSquare, User } from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import {
  GQLGetFeaturedTrainersQuery,
  useCreateCoachingRequestMutation,
  useGetFeaturedTrainersQuery,
} from '@/generated/graphql-client'

type FeaturedTrainer =
  GQLGetFeaturedTrainersQuery['getFeaturedTrainers'][number]

interface TrainerDetailsDrawerProps {
  trainer: FeaturedTrainer | null
  isOpen: boolean
  onClose: () => void
}

export function TrainersTab() {
  const [selectedTrainer, setSelectedTrainer] =
    useState<FeaturedTrainer | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const { data, isLoading } = useGetFeaturedTrainersQuery({
    limit: 30,
  })

  const trainers = data?.getFeaturedTrainers || []

  const handleTrainerClick = (trainer: FeaturedTrainer) => {
    setSelectedTrainer(trainer)
    setIsDrawerOpen(true)
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
              onClick={() => handleTrainerClick(trainer)}
            />
          ))
        )}
      </div>

      <TrainerDetailsDrawer
        trainer={selectedTrainer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

interface TrainerCardProps {
  trainer: FeaturedTrainer
  onClick: () => void
}

function TrainerCard({ trainer, onClick }: TrainerCardProps) {
  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Trainer'

  const initials =
    (trainer.profile?.firstName?.charAt(0) || '') +
    (trainer.profile?.lastName?.charAt(0) || '')

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      variant="gradient"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="size-16">
            {trainer.profile?.avatarUrl && (
              <AvatarImage src={trainer.profile.avatarUrl} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{trainerName}</h3>
                <p className="text-xs text-muted-foreground">
                  {trainer.role === 'TRAINER'
                    ? 'Personal Trainer'
                    : trainer.role}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{trainer.clientCount} clients</span>
                </div>
              </div>
            </div>

            {/* Years of experience */}
            {trainer.profile?.trainerSince && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>
                  {new Date(trainer.profile?.trainerSince).getFullYear() -
                    new Date().getFullYear()}{' '}
                  years of experience
                </span>
              </div>
            )}

            {trainer.profile?.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {trainer.profile.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrainerDetailsDrawer({
  trainer,
  isOpen,
  onClose,
}: TrainerDetailsDrawerProps) {
  const [isRequestingCoaching, setIsRequestingCoaching] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  const createCoachingRequestMutation = useCreateCoachingRequestMutation()

  const handleRequestCoaching = async () => {
    if (!trainer) return

    setIsRequestingCoaching(true)

    try {
      const trainerName =
        trainer.name ||
        `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
        'Trainer'

      await createCoachingRequestMutation.mutateAsync({
        recipientEmail: trainer.profile?.email || '',
        message:
          requestMessage ||
          `Hi ${trainerName}, I'm interested in your coaching services. I'd love to discuss how you can help me achieve my fitness goals.`,
      })

      setRequestSent(true)

      // Reset after 3 seconds
      setTimeout(() => {
        setRequestSent(false)
        setRequestMessage('')
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error sending coaching request:', error)
    } finally {
      setIsRequestingCoaching(false)
    }
  }

  if (!trainer) return null

  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Trainer'

  const initials =
    (trainer.profile?.firstName?.charAt(0) || '') +
    (trainer.profile?.lastName?.charAt(0) || '')

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent dialogTitle={`${trainerName} - Trainer Details`}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="size-20">
              {trainer.profile?.avatarUrl && (
                <AvatarImage src={trainer.profile.avatarUrl} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-xl font-bold">{trainerName}</h2>
              <p className="text-sm text-muted-foreground">
                {trainer.role === 'TRAINER' ? 'Personal Trainer' : trainer.role}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {trainer.clientCount} clients
              </div>
            </div>
          </div>

          {/* Bio */}
          {trainer.profile?.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">
                {trainer.profile.bio}
              </p>
            </div>
          )}

          {/* Experience */}
          <div>
            <h3 className="font-semibold mb-2">Experience</h3>
            <div className="bg-card-on-card p-3 rounded-md text-sm flex items-center gap-2">
              <div className="font-medium">{trainer.clientCount}</div>
              <div className="text-muted-foreground">Active Clients</div>
            </div>
          </div>

          {/* Future: Specialization */}

          {trainer.profile?.specialization &&
            trainer.profile.specialization.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Specialization</h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.profile?.specialization?.map((spec, index) => (
                    <Badge key={index} variant="secondary">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Future: Credentials */}

          {trainer.profile?.credentials &&
            trainer.profile.credentials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Credentials</h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.profile?.credentials?.map((credential, index) => (
                    <Badge key={index} variant="secondary">
                      {credential}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Future: Success Stories */}

          {trainer.profile?.successStories &&
            trainer.profile.successStories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Success Stories</h3>
                <ul className="space-y-1">
                  {trainer.profile?.successStories?.map((story, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {story}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <Separator />

          {/* Request Coaching Section */}
          {requestSent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-700">Request Sent!</h3>
              <p className="text-sm text-muted-foreground">
                {trainerName} will be contacted and will reach out to you soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">Request Coaching</h3>
              <p className="text-sm text-muted-foreground">
                Send a coaching request to {trainerName}. They will contact you
                to discuss your goals and coaching options.
              </p>

              <Button
                onClick={handleRequestCoaching}
                disabled={isRequestingCoaching}
                className="w-full"
                size="lg"
              >
                {isRequestingCoaching ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2 animate-pulse" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Request Coaching
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
