import { Users2Icon } from 'lucide-react'

import { DashboardHeader } from '../components/dashboard-header'

import { CollaborationInvitations } from './components/collaboration-invitations'
import { CollaborationManagement } from './components/collaboration-management'

export default function CollaborationPage() {
  return (
    <div className="container h-full">
      <DashboardHeader
        title="Collaboration"
        description="Manage collaboration invitations and shared plans"
        icon={<Users2Icon />}
      />

      <div className="space-y-8">
        <CollaborationInvitations />
        <CollaborationManagement />
      </div>
    </div>
  )
}
