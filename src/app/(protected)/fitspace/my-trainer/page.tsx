'use client'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import {
  GQLGetMyTrainerQuery,
  GQLMyCoachingRequestsQuery,
  GQLTrainerOfferStatus,
  useCancelCoachingMutation,
  useFitGetMyTrainerOffersQuery,
  useGetMyTrainerQuery,
  useGetTrainerSharedNotesLimitedQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import { useCurrentSubscription } from '@/hooks/use-current-subscription'
import { useScrollToFromParams } from '@/hooks/use-scroll-to'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ClientMeetingsSection } from './components/client-meetings-section'
import { ClientServiceDeliveriesSection } from './components/client-service-deliveries-section'
import { SubscriptionInfoSection } from './components/subscription-info-section'
import { TrainerSharedNotesSection } from './components/trainer-shared-notes-section'

type CoachingRequest = GQLMyCoachingRequestsQuery['coachingRequests'][0]

export default function MyTrainerPage() {
  const { data: requestsData, refetch: refetchRequests } =
    useMyCoachingRequestsQuery()

  const coachingRequests = requestsData?.coachingRequests || []

  const { data: trainerData, isLoading: isLoadingTrainer } =
    useGetMyTrainerQuery()

  const trainer = trainerData?.getMyTrainer

  // Handle scrolling to specific sections from notifications
  useScrollToFromParams([isLoadingTrainer, trainer])

  return (
    <div className="container-hypertro mx-auto max-w-md">
      <DashboardHeader
        title="My Trainer"
        icon={UserCheck}
        variant="blue"
        className="mb-6"
      />
      {isLoadingTrainer && (
        <div className="space-y-4">
          <LoadingSkeleton count={4} variant="lg" />
        </div>
      )}
      {!isLoadingTrainer && trainer && (
        <TrainerView trainer={trainer} refetchRequests={refetchRequests} />
      )}

      {!isLoadingTrainer && !trainer && (
        <NoTrainerView requests={coachingRequests} />
      )}
    </div>
  )
}

interface TrainerViewProps {
  trainer: NonNullable<GQLGetMyTrainerQuery['getMyTrainer']>
  refetchRequests: () => void
}

enum Tab {
  FromTrainer = 'from-trainer',
  PurchasedServices = 'purchased-services',
}

function TrainerView({ trainer, refetchRequests }: TrainerViewProps) {
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

  // Get refetch functions for all queries that need to be refreshed
  const { refetch: refetchTrainer } = useGetMyTrainerQuery()
  const { refetch: refetchTrainerOffers } = useFitGetMyTrainerOffersQuery(
    {
      clientEmail: user?.email || '',
      trainerId: trainer.id,
      status: GQLTrainerOfferStatus.Paid,
    },
    {
      enabled: !!user?.email,
    },
  )
  const { refetch: refetchTrainerNotes } =
    useGetTrainerSharedNotesLimitedQuery()
  const { refetch: refetchSubscription } = useCurrentSubscription(user?.id)
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
          // Refetch all data to update the UI
          await Promise.all([
            refetchTrainer(),
            refetchRequests(),
            refetchTrainerOffers(),
            refetchTrainerNotes(),
            refetchSubscription(),
          ])
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
      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <div className="flex items-center justify-between">
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
              <ButtonLink
                href="/fitspace/explore?tab=trainers"
                className="mt-2"
                iconStart={<Users />}
              >
                Find a Trainer
              </ButtonLink>
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
