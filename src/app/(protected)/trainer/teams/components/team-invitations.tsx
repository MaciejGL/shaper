'use client'

import { formatDistanceToNow } from 'date-fns'
import { Calendar, Check, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GQLTeamInvitationsQuery,
  useRespondToTeamInvitationMutation,
} from '@/generated/graphql-client'

interface TeamInvitationsProps {
  invitations: GQLTeamInvitationsQuery['teamInvitations']
}

export function TeamInvitations({ invitations }: TeamInvitationsProps) {
  const respondMutation = useRespondToTeamInvitationMutation({
    onSuccess: (data) => {
      if (data.respondToTeamInvitation.status === 'ACCEPTED') {
        toast.success('Team invitation accepted! Welcome to the team.')
      } else {
        toast.success('Team invitation declined.')
      }
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
        <div
          key={invitation.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-card"
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

          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              onClick={() => handleRespond(invitation.id, true)}
              disabled={respondMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="size-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRespond(invitation.id, false)}
              disabled={respondMutation.isPending}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <X className="size-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
