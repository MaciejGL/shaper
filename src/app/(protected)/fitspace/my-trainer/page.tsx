'use client'

import { Calendar, Clock, MessageSquare, UserCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Loader } from '@/components/loader'
import { TrainerCard } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  GQLGetMyTrainerQuery,
  GQLMyCoachingRequestsQuery,
  useCancelCoachingMutation,
  useGetMyTrainerQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import { useScrollToFromParams } from '@/hooks/use-scroll-to'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ClientServiceDeliveriesSection } from './components/client-service-deliveries-section'
import { TrainerSharedNotesSection } from './components/trainer-shared-notes-section'

type CoachingRequest = GQLMyCoachingRequestsQuery['coachingRequests'][0]

export default function MyTrainerPage() {
  const { data: requestsData } = useMyCoachingRequestsQuery()

  const coachingRequests = requestsData?.coachingRequests || []

  const { data: trainerData, isLoading: isLoadingTrainer } =
    useGetMyTrainerQuery()

  const trainer = trainerData?.getMyTrainer

  // Handle scrolling to specific sections from notifications
  useScrollToFromParams([isLoadingTrainer, trainer])

  return (
    <div className="container-hypertro mx-auto max-w-md">
      <DashboardHeader title="My Trainer" icon={UserCheck} />
      {isLoadingTrainer && (
        <div className="min-h-[300px] flex-center">
          <Loader />
        </div>
      )}
      {!isLoadingTrainer && trainer && <TrainerView trainer={trainer} />}

      {!isLoadingTrainer && !trainer && (
        <NoTrainerView requests={coachingRequests} />
      )}
    </div>
  )
}

interface TrainerViewProps {
  trainer: NonNullable<GQLGetMyTrainerQuery['getMyTrainer']>
}

function TrainerView({ trainer }: TrainerViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { openModal } = useConfirmationModalContext()
  const { refetch: refetchTrainer } = useGetMyTrainerQuery()
  const { mutateAsync: cancelCoaching } = useCancelCoachingMutation()

  const handleCancelCoaching = () => {
    const trainerName =
      trainer.profile?.firstName && trainer.profile?.lastName
        ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
        : trainer.name || 'your trainer'

    openModal({
      title: 'Cancel Coaching',
      description: `Are you sure you want to cancel your coaching relationship with ${trainerName}? This action cannot be undone.`,
      confirmText: 'Cancel Coaching',
      cancelText: 'Keep Coaching',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await cancelCoaching({})
          // Refetch data to update the UI
          await refetchTrainer()
        } catch (error) {
          console.error('Failed to cancel coaching:', error)
          throw error // Re-throw to prevent modal from closing
        }
      },
    })
  }

  const handleSendMessage = () => {
    // TODO: Implement send message functionality
  }

  return (
    <div className="space-y-4">
      <TrainerCard
        trainer={trainer}
        showExperience={true}
        showClientCount={false}
        variant="secondary"
        onClick={() => setIsDrawerOpen(true)}
      />

      <TrainerDetailsDrawer
        trainer={trainer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        showRequestCoaching={false}
      />

      <Card borderless>
        <CardContent>
          {/* Scheduled Sessions */}
          <div className="flex flex-col gap-2 opacity-50">
            <h3 className="text-lg font-semibold">
              Scheduled Sessions - coming soon
            </h3>
            <p>Available sessions this month: 0</p>
            <p className="text-sm text-muted-foreground">
              You have no scheduled sessions with {trainer.name}.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button iconStart={<Calendar />} disabled>
            Schedule Session
          </Button>
        </CardFooter>
      </Card>

      {/* Trainer Shared Notes Section */}
      <div id="trainer-notes-section">
        <TrainerSharedNotesSection />
      </div>

      {/* Service Deliveries Section */}
      <ClientServiceDeliveriesSection trainerId={trainer.id} />

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="w-full"
          size="lg"
          variant="ghost"
          onClick={handleCancelCoaching}
        >
          End Coaching
        </Button>

        <Button
          className="w-full"
          size="lg"
          disabled
          iconStart={<MessageSquare />}
          onClick={handleSendMessage}
        >
          Contact Trainer
        </Button>
      </div>
    </div>
  )
}

interface NoTrainerViewProps {
  requests: CoachingRequest[]
}

function NoTrainerView({ requests }: NoTrainerViewProps) {
  const pendingRequests = requests.filter(
    (request) => request.status === 'PENDING',
  )
  const rejectedRequests = requests.filter(
    (request) => request.status === 'REJECTED',
  )

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card borderless>
        <CardContent className="p-6 text-center">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

          {pendingRequests.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Request Pending</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You have sent a coaching request. The trainer will review and
                respond soon.
              </p>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Waiting for response
              </Badge>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">
                No Trainer Connected
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't connected with a trainer yet. Explore our featured
                trainers to find the perfect match for your fitness goals.
              </p>
              <Button asChild className="mt-2">
                <Link href="/fitspace/explore?tab=trainers">
                  <Users className="h-4 w-4 mr-2" />
                  Find a Trainer
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card borderless>
          <CardHeader>
            <CardTitle className="text-base">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">
                    {request.recipient?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.recipient?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      {rejectedRequests.length > 0 && (
        <Card borderless>
          <CardHeader>
            <CardTitle className="text-base">Request History</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {rejectedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">
                    {request.recipient?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.recipient?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="destructive">Declined</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
