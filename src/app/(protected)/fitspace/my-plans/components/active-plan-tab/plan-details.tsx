import { formatDate } from 'date-fns'
import { Clock } from 'lucide-react'
import { Calendar } from 'lucide-react'

export function PlanDetails({
  startDate,
  endDate,
}: {
  startDate?: string | null
  endDate?: string | null
}) {
  const startDateFormatted = startDate
    ? formatDate(startDate, 'MMM d, yyyy')
    : null
  const endDateFormatted = endDate ? formatDate(endDate, 'MMM d, yyyy') : null

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/40 shadow-neuromorphic-light dark:shadow-neuromorphic-dark dark:bg-muted/20 p-4 rounded-lg border border-border dark:border-none">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {startDateFormatted && <span>Started {startDateFormatted}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {endDateFormatted && <span>Ends {endDateFormatted}</span>}
      </div>
    </div>
  )
}
