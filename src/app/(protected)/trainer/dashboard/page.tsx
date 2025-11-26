'use client'

import { ClipboardList } from 'lucide-react'

import { DashboardHeader } from '../components/dashboard-header'

import { DeliverablesList } from './components/deliverables-list'

export default function Page() {
  return (
    <div className="container h-full pb-8">
      <DashboardHeader
        title="Deliverables"
        description="Track and complete client deliverables"
        icon={ClipboardList}
      />
      <DeliverablesList />
    </div>
  )
}
