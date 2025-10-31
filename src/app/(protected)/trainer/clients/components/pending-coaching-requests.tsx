'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, UserPlus, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import {
  GQLMyCoachingRequestsQuery,
  useAcceptCoachingRequestMutation,
  useMyCoachingRequestsQuery,
  useRejectCoachingRequestMutation,
} from '@/generated/graphql-client'

type CoachingRequest = GQLMyCoachingRequestsQuery['coachingRequests'][0]

interface PendingCoachingRequestsProps {
  requests: CoachingRequest[]
}

export function PendingCoachingRequests({
  requests,
}: PendingCoachingRequestsProps) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}

function RequestCard({ request }: { request: CoachingRequest }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptCoachingRequestMutation({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
        // Redirect to the new client's profile page
        router.push(`/trainer/clients/${request.sender.id}`)
      },
    })

  const { mutate: rejectRequest, isPending: isRejecting } =
    useRejectCoachingRequestMutation({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
      },
    })

  const clientName =
    request.sender.profile?.firstName && request.sender.profile?.lastName
      ? `${request.sender.profile.firstName} ${request.sender.profile.lastName}`
      : request.sender.name || 'A potential client'

  const initials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon icon={UserPlus} size="xs" variant="blue" />
          New Coaching Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{clientName}</h3>
          </div>
          <Badge variant="primary">Pending</Badge>
        </div>

        {request.message && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Message from client:
            </p>
            <p className="text-sm italic">"{request.message}"</p>
          </div>
        )}

        {request.interestedServices &&
          request.interestedServices.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Interested in:
              </p>
              <div className="flex flex-wrap gap-2">
                {request.interestedServices.map((service: string) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        <div className="text-xs text-muted-foreground">
          Received {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button
          variant="tertiary"
          onClick={() => rejectRequest({ id: request.id })}
          disabled={isAccepting || isRejecting}
          iconStart={<XCircle />}
        >
          Decline
        </Button>
        <Button
          onClick={() => acceptRequest({ id: request.id })}
          disabled={isAccepting || isRejecting}
          iconStart={<CheckCircle />}
        >
          Accept Request
        </Button>
      </CardFooter>
    </Card>
  )
}
