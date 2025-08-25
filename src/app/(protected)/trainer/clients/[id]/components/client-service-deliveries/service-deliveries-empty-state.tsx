import { ClipboardList } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface ServiceDeliveriesEmptyStateProps {
  clientName: string
}

export function ServiceDeliveriesEmptyState({
  clientName,
}: ServiceDeliveriesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No service deliveries
        </h3>
        <p className="text-muted-foreground">
          {clientName} hasn't purchased any services yet.
        </p>
      </CardContent>
    </Card>
  )
}
