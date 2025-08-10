import { LayoutDashboard } from 'lucide-react'

import { DashboardHeader } from '../components/dashboard-header'

export default async function Page() {
  return (
    <div className="container h-full">
      <DashboardHeader title="Dashboard" icon={LayoutDashboard} />
    </div>
  )
}
