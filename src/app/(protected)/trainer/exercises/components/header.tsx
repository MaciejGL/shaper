import { DumbbellIcon, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { DashboardHeader } from '../../components/dashboard-header'

export function Header({
  setIsCreateDialogOpen,
}: {
  setIsCreateDialogOpen: (open: boolean) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-baseline sm:items-baseline gap-4">
      <DashboardHeader
        title="Exercise Library"
        description="Manage and create exercises for your training plans"
        icon={<DumbbellIcon />}
      />
      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="flex items-center gap-2"
        iconStart={<Plus />}
      >
        Create Exercise
      </Button>
    </div>
  )
}
