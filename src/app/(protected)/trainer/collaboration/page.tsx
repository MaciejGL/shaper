'use client'

import { Users2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useMyCollaborationInvitationsQuery,
  useSentCollaborationInvitationsQuery,
} from '@/generated/graphql-client'

import { DashboardHeader } from '../components/dashboard-header'

import { ActiveCollaborators } from './components/active-collaborators'
import { CollaborationInvitations } from './components/collaboration-invitations'
import { CollaboratorsAccess } from './components/collaborators-access'
import { SendInvitationDialog } from './components/send-invitation-dialog'
import { SharedWithMe } from './components/shared-with-me'

export default function CollaborationPage() {
  const {
    data: receivedInvitations,
    refetch: refetchReceived,
    isLoading: isLoadingReceived,
  } = useMyCollaborationInvitationsQuery()
  const {
    data: sentInvitations,
    refetch: refetchSent,
    isLoading: isLoadingSent,
  } = useSentCollaborationInvitationsQuery()

  const totalInvitations =
    receivedInvitations?.myCollaborationInvitations.filter(
      (inv) => inv.status === 'PENDING',
    ).length ?? 0

  return (
    <div className="container h-full">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Collaboration"
          description="Manage collaboration invitations and shared plans"
          icon={<Users2Icon />}
        />
        <SendInvitationDialog
          onSuccess={() => {
            refetchReceived()
            refetchSent()
            toast.success('New collaborator has been invited')
          }}
          buttonText="Add Collaborator"
        />
      </div>

      <Tabs defaultValue="team-members">
        <TabsList className="mb-4">
          <TabsTrigger value="team-members">Team Members</TabsTrigger>
          <TabsTrigger value="access-management">Access Management</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations{' '}
            {totalInvitations > 0 && (
              <Badge className="rounded-full text-[10px]">
                {totalInvitations}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="team-members">
          <ActiveCollaborators />
        </TabsContent>
        <TabsContent value="access-management">
          <CollaboratorsAccess />
        </TabsContent>
        <TabsContent value="shared-with-me">
          <SharedWithMe />
        </TabsContent>
        <TabsContent value="invitations">
          <CollaborationInvitations
            receivedInvitations={receivedInvitations}
            sentInvitations={sentInvitations}
            refetchReceived={refetchReceived}
            refetchSent={refetchSent}
            isLoading={isLoadingReceived || isLoadingSent}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
