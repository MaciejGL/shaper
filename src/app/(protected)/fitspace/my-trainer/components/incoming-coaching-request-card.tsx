'use client'

import { useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
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
  useGetMyTrainerQuery,
  useMyCoachingRequestsQuery,
  useRejectCoachingRequestMutation,
} from '@/generated/graphql-client'

interface IncomingCoachingRequestCardProps {
  request: GQLMyCoachingRequestsQuery['coachingRequests'][0]
}

export function IncomingCoachingRequestCard({
  request,
}: IncomingCoachingRequestCardProps) {
  const queryClient = useQueryClient()

  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptCoachingRequestMutation({
      onSuccess: () => {
        // Invalidate queries to refresh my-trainer page
        queryClient.invalidateQueries({
          queryKey: useGetMyTrainerQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
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

  const trainerName =
    request.sender.profile?.firstName && request.sender.profile?.lastName
      ? `${request.sender.profile.firstName} ${request.sender.profile.lastName}`
      : request.sender.name || 'A trainer'

  return (
    <Card borderless>
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
            <AvatarFallback>
              {trainerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{trainerName}</h3>
          </div>
          <Badge variant="primary">Pending</Badge>
        </div>

        {request.message && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Message:
            </p>
            <p className="text-sm italic">"{request.message}"</p>
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
          loading={isRejecting}
        >
          Decline
        </Button>
        <Button
          onClick={() => acceptRequest({ id: request.id })}
          disabled={isAccepting || isRejecting}
          loading={isAccepting}
        >
          Accept Coaching
        </Button>
      </CardFooter>
    </Card>
  )
}
