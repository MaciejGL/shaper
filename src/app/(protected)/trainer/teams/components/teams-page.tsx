'use client'

import { Mail, Plus, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMyTeamsQuery,
  useTeamInvitationsQuery,
} from '@/generated/graphql-client'
import { FEATURE_FLAGS, useFeatureFlag } from '@/hooks/use-feature-flag'

import { CreateTeamForm } from './create-team-form'
import { TeamDetails } from './team-details'
import { TeamInvitations } from './team-invitations'

export function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const isTeamsEnabled = useFeatureFlag(FEATURE_FLAGS.teams)

  const {
    data: teamsData,
    isLoading: teamsLoading,
    error: teamsError,
  } = useMyTeamsQuery()

  const { data: invitationsData, isLoading: invitationsLoading } =
    useTeamInvitationsQuery()

  const currentTeam = teamsData?.myTeams?.[0]
  const invitations = invitationsData?.teamInvitations || []

  // Feature flag check
  if (!isTeamsEnabled) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert>
          <AlertDescription>
            Teams feature is not currently available. Please contact support if
            you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (teamsLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (teamsError) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load teams. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground">
              Collaborate with other trainers and share resources
            </p>
          </div>

          {currentTeam && !showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="ml-auto"
            >
              <Plus className="size-4 mr-2" />
              Create New Team
            </Button>
          )}
        </div>

        {/* Pending Invitations */}
        {!invitationsLoading && invitations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Mail className="size-5" />
                Team Invitations
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                You have {invitations.length} pending team invitation
                {invitations.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamInvitations invitations={invitations} />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {currentTeam ? (
          <div className="space-y-6">
            {showCreateForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Team</CardTitle>
                  <CardDescription>
                    Create a new team to collaborate with other trainers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateTeamForm onCancel={() => setShowCreateForm(false)} />
                </CardContent>
              </Card>
            ) : (
              <TeamDetails team={currentTeam} />
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto size-24 rounded-full bg-muted flex items-center justify-center">
                <Users className="size-12 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Team Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create or join a team to collaborate with other trainers,
                  share training plans, and manage clients together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setShowCreateForm(true)} size="lg">
                  <Plus className="size-5 mr-2" />
                  Create Team
                </Button>

                <Button variant="outline" size="lg">
                  <UserCheck className="size-5 mr-2" />
                  Join with Invitation
                </Button>
              </div>

              {showCreateForm && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                  <CreateTeamForm onCancel={() => setShowCreateForm(false)} />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
