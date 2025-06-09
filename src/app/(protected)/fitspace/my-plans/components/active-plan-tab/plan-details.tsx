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
    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 px-4 border-t">
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
