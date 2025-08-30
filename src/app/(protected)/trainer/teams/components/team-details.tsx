'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  Crown,
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

import { InviteTeamMemberForm } from './invite-team-member-form'
import { TeamMemberManagement } from './team-member-management'

interface TeamDetailsProps {
  team: GQLMyTeamsQuery['myTeams'][number]
}

export function TeamDetails({ team }: TeamDetailsProps) {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showMemberManagement, setShowMemberManagement] = useState(false)

  return (
    <div className="space-y-6">
      {/* Team Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {team.name}
                {team.isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="size-3 mr-1" />
                    Admin
                  </Badge>
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
            </div>

            {team.isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteForm(true)}
                >
                  <UserPlus className="size-4 mr-2" />
                  Invite Member
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemberManagement(true)}
                >
                  <Settings className="size-4 mr-2" />
                  Manage
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      {member.user.firstName?.[0] || '?'}
                      {member.user.lastName?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {member.user.firstName || ''}{' '}
                        {member.user.lastName || ''}
                      </p>
                      {member.role === 'ADMIN' && (
                        <Crown className="size-3 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(member.joinedAt))}{' '}
                      ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Invite Team Member
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Send an invitation to another trainer to join your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteTeamMemberForm
              teamId={team.id}
              onCancel={() => setShowInviteForm(false)}
              onSuccess={() => setShowInviteForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Member Management Modal */}
      {showMemberManagement && team.isAdmin && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Manage Team Members
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Remove team members or manage permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMemberManagement
              team={team}
              onCancel={() => setShowMemberManagement(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
