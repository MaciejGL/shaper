'use client'

import { MoreVertical, Settings, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLCollaborationInvitationAction,
  GQLMyTeamMembersQuery,
  useMyTeamMembersQuery,
  useRespondToCollaborationInvitationMutation,
} from '@/generated/graphql-client'
import { formatRelativeTime } from '@/lib/date-utils'
import { getUserDisplayName, getUserInitials } from '@/lib/user-utils'

import { LoadingSkeleton } from './loading-skeleton'
import { TeamMemberPlanModal } from './team-member-plan-modal'

export function ActiveCollaborators() {
  const [selectedMember, setSelectedMember] = useState<
    GQLMyTeamMembersQuery['myTeamMembers'][number] | null
  >(null)
  const { data: teamData, refetch, isLoading } = useMyTeamMembersQuery()

  const { mutate: removeFromTeam } =
    useRespondToCollaborationInvitationMutation({
      onSuccess: () => {
        refetch()
        toast.success('Team member removed')
      },
      onError: () => {
        toast.error('Failed to remove team member')
      },
    })

  const handleRemoveTeamMember = (invitationId: string) => {
    removeFromTeam({
      input: {
        invitationId,
        action: GQLCollaborationInvitationAction.Reject,
      },
    })
  }

  const teamMembers = teamData?.myTeamMembers || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Team</h2>
        <Badge variant="outline" className="text-sm">
          {teamMembers.length} member{teamMembers.length === 1 ? '' : 's'}
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      ) : null}

      {!isLoading && teamMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No team members yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Send collaboration invitations to build your team
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && teamMembers.length > 0 ? (
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getUserInitials(member.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {getUserDisplayName(member.user)}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                        >
                          Team Member
                        </Badge>
                        {member.isCurrentUserSender && (
                          <Badge variant="secondary" className="text-xs">
                            Invited by you
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedMember(member)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Plans
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Added {formatRelativeTime(member.createdAt)}</span>
                  <span>by {getUserDisplayName(member.addedBy)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {selectedMember && (
        <TeamMemberPlanModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          teamMember={selectedMember}
        />
      )}
    </div>
  )
}
