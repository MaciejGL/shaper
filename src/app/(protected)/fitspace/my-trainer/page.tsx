'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Clock, MessageSquare, UserCheck, Users } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { MessengerModal } from '@/components/messenger-modal/messenger-modal'
import { TrainerCard } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import {
  GQLGetMyTrainerQuery,
  GQLMyCoachingRequestsQuery,
  useCancelCoachingMutation,
  useCancelCoachingRequestMutation,
  useFitGetMyTrainerOffersQuery,
  useGetMyTrainerQuery,
  useGetTrainerSharedNotesLimitedQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import { useScrollToFromParams } from '@/hooks/use-scroll-to'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ClientMeetingsSection } from './components/client-meetings-section'
import { ClientServiceDeliveriesSection } from './components/client-service-deliveries-section'
import { IncomingCoachingRequestCard } from './components/incoming-coaching-request-card'
import { PendingOffersList } from './components/pending-offers-list'
import { SubscriptionInfoSection } from './components/subscription-info-section'
import { TrainerSharedNotesSection } from './components/trainer-shared-notes-section'

type CoachingRequest = GQLMyCoachingRequestsQuery['coachingRequests'][0]

export default function MyTrainerPage() {
  const { data: requestsData } = useMyCoachingRequestsQuery()
  console.log(requestsData)
  const coachingRequests = requestsData?.coachingRequests || []

  const { data: trainerData, isLoading: isLoadingTrainer } =
    useGetMyTrainerQuery()

  const trainer = trainerData?.getMyTrainer

  // Handle scrolling to specific sections from notifications
  useScrollToFromParams([isLoadingTrainer, trainer])

  return (
    <div className="container-hypertro mx-auto max-w-md">
      <DashboardHeader
        title="Coaching"
        icon={UserCheck}
        variant="blue"
        className="mb-6"
      />
      {isLoadingTrainer && (
        <div className="space-y-4">
          <LoadingSkeleton count={1} variant="sm" />
          <LoadingSkeleton count={2} variant="lg" />
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

enum Tab {
  FromTrainer = 'from-trainer',
  PurchasedServices = 'purchased-services',
}

function TrainerView({ trainer }: TrainerViewProps) {
  const [tab, setTab] = useQueryState<Tab>(
    'tab',
    parseAsStringEnum<Tab>([Tab.FromTrainer, Tab.PurchasedServices])
      .withDefault(Tab.FromTrainer)
      .withOptions({ clearOnDefault: true }),
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isMessengerOpen, setIsMessengerOpen] = useState(false)
  const { openModal } = useConfirmationModalContext()
  const { user } = useUser()
  const queryClient = useQueryClient()

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
          // Invalidate all related queries to update the UI
          await queryClient.invalidateQueries({
            queryKey: useGetMyTrainerQuery.getKey(),
          })
          await queryClient.invalidateQueries({
            queryKey: useMyCoachingRequestsQuery.getKey(),
          })
          await queryClient.invalidateQueries({
            queryKey: useFitGetMyTrainerOffersQuery.getKey({
              clientEmail: user?.email || '',
              trainerId: trainer.id,
            }),
          })
          await queryClient.invalidateQueries({
            queryKey: useGetTrainerSharedNotesLimitedQuery.getKey(),
          })
        } catch (error) {
          console.error('Failed to cancel coaching:', error)
          throw error // Re-throw to prevent modal from closing
        }
      },
    })
  }

  const handleSendMessage = () => {
    setIsMessengerOpen(true)
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

      <PendingOffersList trainerId={trainer.id} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="from-trainer">From Trainer</TabsTrigger>
            <TabsTrigger value="purchased-services">
              Purchased Services
            </TabsTrigger>
          </TabsList>
          <Button
            iconOnly={<MessageSquare />}
            onClick={handleSendMessage}
            variant="tertiary"
          >
            Contact Trainer
          </Button>
        </div>
        <TabsContent value="from-trainer" className="space-y-4">
          {/* Scheduled Meetings */}
          <ClientMeetingsSection />

          {/* Trainer Shared Notes Section */}
          <div id="trainer-notes-section">
            <TrainerSharedNotesSection />
          </div>
        </TabsContent>
        <TabsContent value="purchased-services" className="space-y-4">
          {/* Service Deliveries Section */}
          <ClientServiceDeliveriesSection trainerId={trainer.id} />

          {/* Subscription Information */}
          <SubscriptionInfoSection />
          <Button
            className="w-full"
            size="lg"
            variant="tertiary"
            onClick={handleCancelCoaching}
          >
            Cancel Coaching
          </Button>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-2"></div>

      {/* Messenger Modal */}
      <MessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        partnerId={trainer.id}
      />
    </div>
  )
}

interface NoTrainerViewProps {
  requests: CoachingRequest[]
}

function NoTrainerView({ requests }: NoTrainerViewProps) {
  const { user } = useUser()
  const currentUserId = user?.id
  const queryClient = useQueryClient()
  const { openModal } = useConfirmationModalContext()

  // Separate incoming vs outgoing requests with simple status filtering
  const incomingRequests = requests.filter(
    (req) => req.recipient.id === currentUserId,
  )
  const outgoingRequests = requests.filter(
    (req) => req.sender.id === currentUserId,
  )

  // Get pending incoming coaching requests (from trainers requesting to coach user)
  const pendingIncomingRequest = incomingRequests
    .filter((req) => req.status === 'PENDING')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .at(0)

  // Get only the latest pending outgoing request
  const pendingOutgoingRequest = outgoingRequests
    .filter((request) => request.status === 'PENDING')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .at(0)

  const { mutateAsync: cancelRequest } = useCancelCoachingRequestMutation()

  const handleWithdrawRequest = () => {
    if (!pendingOutgoingRequest) return

    const trainerName = pendingOutgoingRequest.recipient.name || 'this trainer'

    openModal({
      title: 'Withdraw Request',
      description: `Are you sure you want to withdraw your coaching request to ${trainerName}?`,
      confirmText: 'Withdraw Request',
      cancelText: 'Keep Request',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await cancelRequest({ id: pendingOutgoingRequest.id })
          await queryClient.invalidateQueries({
            queryKey: useMyCoachingRequestsQuery.getKey(),
          })
        } catch (error) {
          console.error('Failed to withdraw request:', error)
          throw error
        }
      },
    })
  }

  // If there's an incoming request, show ONLY that
  if (pendingIncomingRequest) {
    return <IncomingCoachingRequestCard request={pendingIncomingRequest} />
  }

  // If there's a pending outgoing request, show card with withdraw option
  if (pendingOutgoingRequest) {
    const trainerName =
      pendingOutgoingRequest.recipient.name || 'Your selected trainer'

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Request Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{trainerName}</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingOutgoingRequest.recipient.email}
                </p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>

            {pendingOutgoingRequest.message && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Your message:
                </p>
                <p className="text-sm italic">
                  "{pendingOutgoingRequest.message}"
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Sent{' '}
              {new Date(pendingOutgoingRequest.createdAt).toLocaleDateString()}
            </div>

            <p className="text-sm text-muted-foreground">
              The trainer will review your request and reach out to you soon.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="tertiary"
              onClick={handleWithdrawRequest}
              className="w-full"
            >
              Withdraw Request
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // No trainer and no pending requests - show find trainer
  return (
    <Card borderless>
      <CardContent className="p-6 text-center">
        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Trainer Connected</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You haven't connected with a trainer yet. Explore our featured
          trainers to find the perfect match for your fitness goals.
        </p>
        <ButtonLink
          href="/fitspace/explore?tab=trainers"
          className="mt-2"
          iconStart={<Users />}
        >
          Find a Trainer
        </ButtonLink>
      </CardContent>
    </Card>
  )
}
