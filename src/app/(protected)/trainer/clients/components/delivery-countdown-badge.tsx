import { Badge } from '@/components/ui/badge'

interface DeliveryCountdownBadgeProps {
  daysUntilDue: number
  isOverdue: boolean
  isCompleted: boolean
}

export function DeliveryCountdownBadge({
  daysUntilDue,
  isOverdue,
  isCompleted,
}: DeliveryCountdownBadgeProps) {
  if (isCompleted) return null

  if (isOverdue) {
    return (
      <Badge variant="destructive" size="lg">
        Overdue
      </Badge>
    )
  }

  if (daysUntilDue === 0) {
    return (
      <Badge variant="destructive" size="lg">
        Today
      </Badge>
    )
  }

  if (daysUntilDue === 1) {
    return (
      <Badge variant="destructive" size="lg">
        1d
      </Badge>
    )
  }

  if (daysUntilDue <= 3) {
    return (
      <Badge variant="warning" size="lg">
        {daysUntilDue}d
      </Badge>
    )
  }

  if (daysUntilDue <= 7) {
    return (
      <Badge variant="outline" size="lg">
        {daysUntilDue}d
      </Badge>
    )
  }

  return null
}
