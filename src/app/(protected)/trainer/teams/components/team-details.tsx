'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  Crown,
  Edit3,
  MapPin,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { GQLMyTeamsQuery } from '@/generated/graphql-client'

import { EditTeamNameModal } from './edit-team-name-modal'
import { InviteMemberModal } from './invite-member-modal'
import { ManageMembersModal } from './manage-members-modal'
import { TeamStripeConnect } from './team-stripe-connect'

interface TeamDetailsProps {
  team: GQLMyTeamsQuery['myTeams'][number]
}

export function TeamDetails({ team }: TeamDetailsProps) {
  const [showEditNameModal, setShowEditNameModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showManageMembersModal, setShowManageMembersModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Team Overview Card */}
      <Card borderless>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-3 w-full">
              <CardTitle className="flex items-center gap-2 w-full">
                <span>{team.name}</span>
                {team.isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditNameModal(true)}
                    className="h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="size-3" />
                  </Button>
                )}
                {team.isAdmin && (
                  <div className="flex gap-2 ml-auto max-md:hidden">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                      iconStart={<UserPlus />}
                    >
                      Invite Member
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowManageMembersModal(true)}
                      iconStart={<Settings />}
                    >
                      Manage Members
                    </Button>
                  </div>
                )}
              </CardTitle>

              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {team.memberCount} member{team.memberCount === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  Created {formatDistanceToNow(new Date(team.createdAt))} ago
                </span>
              </CardDescription>

              {team.isAdmin && (
                <div className="flex gap-2 md:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    iconStart={<UserPlus />}
                  >
                    Invite Member
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowManageMembersModal(true)}
                    iconStart={<Settings />}
                  >
                    Manage Members
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Locations */}
          {team.locations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="size-4" />
                Operating Locations
              </h4>
              <div className="flex flex-wrap gap-2">
                {team.locations.map((location) => (
                  <Badge key={location.id} variant="outline">
                    {location.city}, {location.country}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="size-4" />
              Team Members
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <Avatar className="size-10">
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
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
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
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDistanceToNow(new Date(member.joinedAt))}{' '}
                        ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Stripe Connect Setup - Only for Admins */}
          <TeamStripeConnect team={team} />
        </CardContent>
      </Card>

      {/* Modals */}
      <EditTeamNameModal
        open={showEditNameModal}
        onOpenChange={setShowEditNameModal}
        teamId={team.id}
        currentName={team.name}
      />

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        teamId={team.id}
      />

      <ManageMembersModal
        open={showManageMembersModal}
        onOpenChange={setShowManageMembersModal}
        team={team}
      />
    </div>
  )
}
