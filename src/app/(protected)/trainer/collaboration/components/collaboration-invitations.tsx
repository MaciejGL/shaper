'use client'

import { CheckIcon, MailIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLCollaborationInvitationAction,
  GQLMyCollaborationInvitationsQuery,
  GQLSentCollaborationInvitationsQuery,
  useRespondToCollaborationInvitationMutation,
} from '@/generated/graphql-client'
import { formatRelativeTime } from '@/lib/date-utils'
import { getUserDisplayName } from '@/lib/user-utils'

import { LoadingSkeleton } from './loading-skeleton'

export function CollaborationInvitations({
  receivedInvitations,
  sentInvitations,
  refetchReceived,
  refetchSent,
  isLoading,
}: {
  receivedInvitations?: GQLMyCollaborationInvitationsQuery
  sentInvitations?: GQLSentCollaborationInvitationsQuery
  refetchReceived: () => void
  refetchSent: () => void
  isLoading: boolean
}) {
  const { mutate: respondToInvitation, isPending: isResponding } =
    useRespondToCollaborationInvitationMutation({
      onSuccess: () => {
        refetchReceived()
        refetchSent()
        toast.success('Invitation response sent')
      },
      onError: (error) => {
        toast.error('Failed to respond to invitation')
        console.error('Error responding to invitation:', error)
      },
    })

  const handleInvitationResponse = (
    invitationId: string,
    action: GQLCollaborationInvitationAction,
  ) => {
    respondToInvitation({
      input: {
        invitationId,
        action,
      },
    })
  }

  const pendingReceived =
    receivedInvitations?.myCollaborationInvitations.filter(
      (inv) => inv.status === 'PENDING',
    ) || []

  const pendingSent =
    sentInvitations?.sentCollaborationInvitations.filter(
      (inv) => inv.status === 'PENDING',
    ) || []

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Received Invitations{' '}
          {pendingReceived.length > 0 && (
            <Badge className="ml-2 rounded-full">
              {pendingReceived.length}
            </Badge>
          )}
        </h2>
        <div className="space-y-4">
          {isLoading ? <LoadingSkeleton count={3} /> : null}
          {!isLoading &&
          receivedInvitations?.myCollaborationInvitations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MailIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No invitations received
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading &&
          (receivedInvitations?.myCollaborationInvitations.length ?? 0) > 0
            ? receivedInvitations?.myCollaborationInvitations.map(
                (invitation) => (
                  <Card key={invitation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg">
                              Collaboration Request
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              From{' '}
                              <span className="font-medium">
                                {getUserDisplayName(invitation.sender)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              invitation.status === 'PENDING'
                                ? 'outline'
                                : invitation.status === 'ACCEPTED'
                                  ? 'primary'
                                  : 'secondary'
                            }
                          >
                            {invitation.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(invitation.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {invitation.message && (
                        <p className="text-sm mb-4">{invitation.message}</p>
                      )}
                      {invitation.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleInvitationResponse(
                                invitation.id,
                                GQLCollaborationInvitationAction.Accept,
                              )
                            }
                            loading={isResponding}
                            iconStart={<CheckIcon className="h-4 w-4" />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleInvitationResponse(
                                invitation.id,
                                GQLCollaborationInvitationAction.Reject,
                              )
                            }
                            loading={isResponding}
                            iconStart={<XIcon className="h-4 w-4" />}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )
            : null}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Sent Invitations{' '}
          {pendingSent.length > 0 && (
            <Badge className="ml-2 rounded-full">{pendingSent.length}</Badge>
          )}
        </h2>

        <div className="space-y-4">
          {isLoading ? <LoadingSkeleton count={3} /> : null}
          {!isLoading &&
          sentInvitations?.sentCollaborationInvitations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MailIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No invitations sent
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading &&
          (sentInvitations?.sentCollaborationInvitations.length ?? 0) > 0
            ? sentInvitations?.sentCollaborationInvitations.map(
                (invitation) => (
                  <Card key={invitation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg">
                              Invitation to{' '}
                              {getUserDisplayName(invitation.recipient)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {formatRelativeTime(invitation.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            invitation.status === 'PENDING'
                              ? 'outline'
                              : invitation.status === 'ACCEPTED'
                                ? 'primary'
                                : 'secondary'
                          }
                        >
                          {invitation.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {invitation.message && (
                        <p className="text-sm text-muted-foreground">
                          {invitation.message}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ),
              )
            : null}
        </div>
      </div>
    </div>
  )
}
