import { Users2Icon } from 'lucide-react'

import { DashboardHeader } from '../components/dashboard-header'

import { ClientsFilter } from './components/clients-filter'
import { ClientsTabs } from './components/clients-tabs'

export default async function Page() {
  return (
    <div className="container mx-auto">
      <DashboardHeader
        title="Clients"
        description="Manage your clients, track their progress, and schedule sessions."
        icon={<Users2Icon />}
      />
      <div className="space-y-6">
        <ClientsFilter />
        <ClientsTabs />
      </div>
    </div>
  )
}
