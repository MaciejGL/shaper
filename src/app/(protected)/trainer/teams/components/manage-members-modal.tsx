'use client'

import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Crown, UserX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  GQLMyTeamsQuery,
  useRemoveTeamMemberMutation,
} from '@/generated/graphql-client'

interface ManageMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: GQLMyTeamsQuery['myTeams'][number]
}

export function ManageMembersModal({
  open,
  onOpenChange,
  team,
}: ManageMembersModalProps) {
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const removeMemberMutation = useRemoveTeamMemberMutation({
    onSuccess: () => {
      toast.success('Team member removed successfully')
      setMemberToRemove(null)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to remove team member'
      toast.error(message)
    },
  })

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate({
      input: {
        teamId: team.id,
        memberId,
      },
    })
  }

  const memberToRemoveData = team.members.find((m) => m.id === memberToRemove)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dialogTitle="Manage Team Members"
          className="sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
            <DialogDescription>
              Remove team members or manage permissions for "{team.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Removing a team member will revoke their access to team
                resources and shared training plans. This action cannot be
                undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {team.members.map((member) => {
                const canRemove = team.isAdmin && member.role !== 'ADMIN'

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage
                          src={member.user.image || undefined}
                          alt={`${member.user.firstName || ''} ${member.user.lastName || ''}`}
                        />
                        <AvatarFallback>
                          {member.user.firstName?.[0] || ''}
                          {member.user.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {member.user.firstName || ''}{' '}
                            {member.user.lastName || ''}
                          </p>
                          {member.role === 'ADMIN' && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="size-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{' '}
                          {formatDistanceToNow(new Date(member.joinedAt))} ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canRemove ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMemberToRemove(member.id)}
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <UserX className="size-4 mr-2" />
                          Remove
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {member.role === 'ADMIN' ? 'Admin' : 'Cannot Remove'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <DialogContent dialogTitle="Remove Team Member">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <strong>
                {memberToRemoveData?.user.firstName || ''}{' '}
                {memberToRemoveData?.user.lastName || ''}
              </strong>{' '}
              from the team? They will lose access to all team resources and
              shared plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                memberToRemove && handleRemoveMember(memberToRemove)
              }
              disabled={removeMemberMutation.isPending}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
