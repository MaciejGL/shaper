'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Clock, UserCheck, Users } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { ExtendHeader } from '@/components/extend-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
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
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import {
  GQLGetMyTrainerQuery,
  GQLMyCoachingRequestsQuery,
  useCancelCoachingMutation,
  useCancelCoachingRequestMutation,
  useFitGetMyTrainerOffersQuery,
  useGetMySubscriptionStatusQuery,
  useGetMyTrainerQuery,
  useGetTrainerSharedNotesLimitedQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import { useScrollToFromParams } from '@/hooks/use-scroll-to'

import { ClientMeetingsSection } from './components/client-meetings-section'
import { ClientServiceDeliveriesSection } from './components/client-service-deliveries-section'
import { IncomingCoachingRequestCard } from './components/incoming-coaching-request-card'
import { PendingOffersList } from './components/pending-offers-list'
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
    <>
      {isLoadingTrainer && (
        <ExtendHeader
          headerChildren={
            <div className="px-2 py-4 dark">
              <LoadingSkeleton
                count={1}
                variant="sm"
                cardVariant="secondary"
                withBorder
              />
            </div>
          }
        >
          <div className="space-y-4">
            <LoadingSkeleton count={1} variant="md" />
            <LoadingSkeleton count={3} variant="lg" />
          </div>
        </ExtendHeader>
      )}
      {!isLoadingTrainer && trainer && <TrainerView trainer={trainer} />}

      {!isLoadingTrainer && !trainer && (
        <div className="pt-4 px-4">
          <NoTrainerView requests={coachingRequests} />
        </div>
      )}
    </>
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
  const { openModal } = useConfirmationModalContext()
  const { user, subscription } = useUser()
  const queryClient = useQueryClient()

  const { mutateAsync: cancelCoaching } = useCancelCoachingMutation()

  const handleCancelCoaching = () => {
    const trainerName =
      trainer.profile?.firstName && trainer.profile?.lastName
        ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
        : trainer.name || 'your trainer'

    // Check if user has active coaching subscription
    const hasActiveSubscription = subscription?.trainerId === trainer.id

    // Build description based on subscription status
    const baseDescription = `Are you sure you want to cancel your coaching relationship with ${trainerName}?`
    const subscriptionWarning = hasActiveSubscription
      ? '\n\nYour coaching subscription will be cancelled and you will continue to have access until the end of your current billing period. You will not be charged anymore.'
      : ''
    const description = `${baseDescription}${subscriptionWarning}\n\nThis action cannot be undone.`

    openModal({
      title: 'Cancel Coaching',
      description,
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
          await queryClient.invalidateQueries({
            queryKey: useGetMySubscriptionStatusQuery.getKey(),
          })
        } catch (error) {
          console.error('Failed to cancel coaching:', error)
          throw error // Re-throw to prevent modal from closing
        }
      },
    })
  }

  return (
    <ExtendHeader
      classNameContent="px-0 pt-0"
      headerChildren={
        <div className="dark space-y-6 pb-6 pt-4">
          <TrainerCard
            trainer={trainer}
            showExperience={true}
            showClientCount={false}
            variant="secondary"
            className="rounded-2xl !border"
            onClick={() => setIsDrawerOpen(true)}
          />

          {isDrawerOpen && (
            <TrainerDetailsDrawer
              trainer={trainer}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              showRequestCoaching={false}
            />
          )}

          <PendingOffersList trainerId={trainer.id} />
        </div>
      }
    >
      <div className="space-y-6 ">
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <div className="grid items-center mb-2 gap-2">
            <PrimaryTabList
              options={[
                { label: 'From Trainer', value: Tab.FromTrainer },
                { label: 'Purchased Services', value: Tab.PurchasedServices },
              ]}
              onClick={setTab}
              active={tab}
              size="lg"
              className="grid grid-cols-2"
              classNameButton="text-sm px-3"
            />
          </div>
          <TabsContent value="from-trainer" className="space-y-4 px-4">
            {/* Scheduled Meetings */}
            <ClientMeetingsSection />

            {/* Trainer Shared Notes Section */}
            <div id="trainer-notes-section">
              <TrainerSharedNotesSection />
            </div>
          </TabsContent>
          <TabsContent value="purchased-services" className="space-y-4 px-4">
            <SubscriptionInfoSection />
            {/* Subscription Information */}
            {/* Service Deliveries Section */}
            <ClientServiceDeliveriesSection trainerId={trainer.id} />

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
      </div>
    </ExtendHeader>
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
      pendingOutgoingRequest.recipient.profile?.firstName &&
      pendingOutgoingRequest.recipient.profile?.lastName
        ? `${pendingOutgoingRequest.recipient.profile.firstName} ${pendingOutgoingRequest.recipient.profile.lastName}`
        : pendingOutgoingRequest.recipient.name || 'Your selected trainer'

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
    <Card>
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
