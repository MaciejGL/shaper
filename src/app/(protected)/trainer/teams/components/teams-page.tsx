'use client'

import { Mail, Plus, Users } from 'lucide-react'
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

import { DashboardHeader } from '../../components/dashboard-header'

import { CreateTeamForm } from './create-team-form'
import { TeamDetails } from './team-details'
import { TeamInvitations } from './team-invitations'

export function TeamsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { isEnabled: isTeamsEnabled, isLoading: isFeatureFlagLoading } =
    useFeatureFlag(FEATURE_FLAGS.teams)

  const {
    data: teamsData,
    isLoading: teamsLoading,
    error: teamsError,
    isRefetching: teamsRefetching,
    refetch: refetchTeams,
  } = useMyTeamsQuery()

  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useTeamInvitationsQuery()

  const currentTeam = teamsData?.myTeams?.[0]
  const invitations = invitationsData?.teamInvitations || []

  // Feature flag loading state
  if (isFeatureFlagLoading) {
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

  // Feature flag check
  if (!isTeamsEnabled && !isFeatureFlagLoading) {
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

  if (teamsLoading || teamsRefetching) {
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
    <div className="container">
      <div className="flex max-md:flex-col gap-4 justify-between mb-6">
        <DashboardHeader
          title="Teams"
          description="Collaborate with other trainers and share resources"
          icon={Users}
          className="mb-0"
        />
        {currentTeam && !showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="secondary"
            className="ml-auto self-end"
            iconStart={<Plus />}
          >
            Create New Team
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* Pending Invitations */}
        {!invitationsLoading && invitations.length > 0 && (
          <Card borderless>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5" />
                Team Invitations
              </CardTitle>
              <CardDescription>
                You have {invitations.length} pending team invitation
                {invitations.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamInvitations
                invitations={invitations}
                refetchInvitations={refetchInvitations}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {currentTeam ? (
          <div className="space-y-6">
            {showCreateForm ? (
              <Card borderless>
                <CardHeader>
                  <CardTitle>Create New Team</CardTitle>
                  <CardDescription>
                    Create a new team to collaborate with other trainers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateTeamForm
                    onCancel={() => setShowCreateForm(false)}
                    onSuccess={async () => {
                      await refetchTeams()
                      setShowCreateForm(false)
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <TeamDetails team={currentTeam} />
            )}
          </div>
        ) : (
          <Card borderless className="text-center py-12">
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
                <Button
                  onClick={() => setShowCreateForm(true)}
                  size="lg"
                  iconStart={<Plus />}
                >
                  Create Team
                </Button>
              </div>

              {showCreateForm && (
                <div className="mt-8 text-left max-w-2xl mx-auto">
                  <CreateTeamForm
                    onCancel={() => setShowCreateForm(false)}
                    onSuccess={async () => {
                      await refetchTeams()
                      setShowCreateForm(false)
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
