'use client'

import { formatDistanceToNow } from 'date-fns'
import { Calendar, Check, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  GQLTeamInvitationsQuery,
  useRespondToTeamInvitationMutation,
} from '@/generated/graphql-client'

interface TeamInvitationsProps {
  invitations: GQLTeamInvitationsQuery['teamInvitations']
  refetchInvitations: () => void
}

export function TeamInvitations({
  invitations,
  refetchInvitations,
}: TeamInvitationsProps) {
  const respondMutation = useRespondToTeamInvitationMutation({
    onSuccess: (data) => {
      if (data.respondToTeamInvitation.status === 'ACCEPTED') {
        toast.success('Team invitation accepted! Welcome to the team.')
      } else {
        toast.success('Team invitation declined.')
      }
      refetchInvitations()
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to respond to invitation'
      toast.error(message)
    },
  })

  const handleRespond = (invitationId: string, accept: boolean) => {
    respondMutation.mutate({
      input: {
        invitationId,
        accept,
      },
    })
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card
          key={invitation.id}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="size-12">
              <AvatarImage
                src={invitation.invitedBy.image || undefined}
                alt={`${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`}
              />
              {invitation.invitedBy.firstName &&
                invitation.invitedBy.lastName && (
                  <AvatarFallback>
                    {invitation.invitedBy.firstName[0]}
                    {invitation.invitedBy.lastName[0]}
                  </AvatarFallback>
                )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-base">
                  {invitation.team.name}
                </h4>
                <Badge variant="outline" className="text-xs">
                  Team Invitation
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                Invited by {invitation.invitedBy.firstName}{' '}
                {invitation.invitedBy.lastName}
              </p>

              {invitation.team.locations.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="size-3" />
                  {invitation.team.locations
                    .map((loc) => `${loc.city}, ${loc.country}`)
                    .join(' • ')}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Invited {formatDistanceToNow(
                  new Date(invitation.createdAt),
                )}{' '}
                ago
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Button
              size="sm"
              onClick={() => handleRespond(invitation.id, true)}
              disabled={respondMutation.isPending}
              iconStart={<Check />}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleRespond(invitation.id, false)}
              disabled={respondMutation.isPending}
              iconStart={<X />}
            >
              Decline
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
