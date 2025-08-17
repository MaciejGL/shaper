'use client'

import { Clock, Loader2, MessageSquare, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'

import { Loader } from '@/components/loader'
import { TrainerCard } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLGetMyTrainerQuery,
  GQLMyCoachingRequestsQuery,
  useGetMyTrainerQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

type CoachingRequest = GQLMyCoachingRequestsQuery['coachingRequests'][0]

export default function MyTrainerPage() {
  const { data: requestsData } = useMyCoachingRequestsQuery()

  const coachingRequests = requestsData?.coachingRequests || []

  const { data: trainerData, isLoading: isLoadingTrainer } =
    useGetMyTrainerQuery()

  const trainer = trainerData?.getMyTrainer

  return (
    <div className="container-hypertro mx-auto mb-24 max-w-md">
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

  const handleCancelCoaching = () => {
    console.log('Cancel Coaching')
  }

  const handleSendMessage = () => {
    console.log('Send Message')
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

      {/* Message Button */}

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="w-full"
          size="lg"
          disabled
          onClick={handleCancelCoaching}
        >
          Cancel Coaching
        </Button>

        <Button
          className="w-full"
          size="lg"
          disabled
          iconStart={<MessageSquare />}
          onClick={handleSendMessage}
        >
          Send Message
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
      <Card>
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
              <Button className="mt-2">
                <Users className="h-4 w-4 mr-2" />
                Find a Trainer
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
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
        <Card>
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
