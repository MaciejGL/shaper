import { Badge } from '@/components/ui/badge'

interface ProgramDetailsSectionProps {
  weekCount: number
  formattedUserCount?: string | null
  sessionsPerWeek?: number | null
  avgSessionTime?: number | null
}

export function ProgramDetailsSection({
  weekCount,
  formattedUserCount,
  sessionsPerWeek,
  avgSessionTime,
}: ProgramDetailsSectionProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Badge variant="secondary" size="lg" className="w-full justify-between">
          <span className="text-muted-foreground">Weeks:</span>
          <span className="font-medium text-base">{weekCount}</span>
        </Badge>

        {sessionsPerWeek && (
          <Badge
            variant="secondary"
            size="lg"
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">Sessions/week:</span>
            <span className="font-medium text-base">{sessionsPerWeek}</span>
          </Badge>
        )}
        {avgSessionTime && (
          <Badge
            variant="secondary"
            size="lg"
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">Avg. time:</span>
            <span className="font-medium text-base">{avgSessionTime} min</span>
          </Badge>
        )}
        {formattedUserCount && (
          <Badge
            variant="secondary"
            size="lg"
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">Users enrolled:</span>
            <span className="font-medium text-base">{formattedUserCount}</span>
          </Badge>
        )}
      </div>
    </div>
  )
}
