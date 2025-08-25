import { ClipboardList } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

interface ServiceDeliveriesHeaderProps {
  count: number
}

export function ServiceDeliveriesHeader({
  count,
}: ServiceDeliveriesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Service Deliveries & Tasks</h2>
      </div>
      <Badge variant="outline">{count} active</Badge>
    </div>
  )
}
