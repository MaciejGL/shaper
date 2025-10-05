'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Clock, MessageSquare, UserCheck, Users } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { MessengerModal } from '@/components/messenger-modal/messenger-modal'
import { PendingCoachingRequestBanner } from '@/components/pending-coaching-request-banner'
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
  useCancelCoachingMutation,
  useFitGetMyTrainerOffersQuery,
  useGetMyTrainerQuery,
  useGetTrainerSharedNotesLimitedQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import { useScrollToFromParams } from '@/hooks/use-scroll-to'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { ClientMeetingsSection } from './components/client-meetings-section'
import { ClientServiceDeliveriesSection } from './components/client-service-deliveries-section'
import { SubscriptionInfoSection } from './components/subscription-info-section'
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

  // Group requests by recipient/sender to find latest status with each person
  const getLatestRequestWithTrainer = (trainerId: string) => {
    const requestsWithTrainer = requests.filter(
      (req) => req.recipient.id === trainerId || req.sender.id === trainerId,
    )
    return requestsWithTrainer.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]
  }

  // Get unique trainer IDs from all requests (the person who is NOT the current user)
  const trainerIds = [
    ...new Set(
      requests
        .map((req) => {
          if (req.sender.id === currentUserId) return req.recipient.id
          if (req.recipient.id === currentUserId) return req.sender.id
          return null
        })
        .filter((id): id is string => id !== null),
    ),
  ]

  // Get latest request for each trainer
  const latestRequests = trainerIds
    .map((trainerId) => getLatestRequestWithTrainer(trainerId))
    .filter(Boolean)

  const pendingRequests = latestRequests.filter(
    (request) => request.status === 'PENDING',
  )
  const cancelledRequests = latestRequests.filter(
    (request) => request.status === 'CANCELLED',
  )
  const rejectedRequests = latestRequests.filter(
    (request) => request.status === 'REJECTED',
  )

  return (
    <div className="space-y-6">
      {/* Pending Request Banner */}
      {pendingRequests.length > 0 && (
        <PendingCoachingRequestBanner
          trainerName={
            pendingRequests[0].recipient.name || 'Your selected trainer'
          }
        />
      )}

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
          ) : cancelledRequests.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-2">Coaching Cancelled</h2>
              <p className="text-sm text-muted-foreground mb-4">
                You have cancelled your coaching relationship. If you had an
                active subscription, you will keep access until the end of your
                billing period.
              </p>
              <ButtonLink
                href="/fitspace/explore?tab=trainers"
                className="mt-2"
                iconStart={<Users />}
              >
                Find a New Trainer
              </ButtonLink>
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
