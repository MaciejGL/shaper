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
        <Badge
          variant="outline"
          size="lg"
          className="w-full justify-between py-2"
        >
          <span className="text-muted-foreground font-normal text-sm">
            Weeks:
          </span>
          <span className="font-medium text-base">{weekCount}</span>
        </Badge>

        {sessionsPerWeek && (
          <Badge
            variant="outline"
            size="lg"
            className="w-full justify-between py-2"
          >
            <span className="text-muted-foreground font-normal text-sm">
              Sessions/week:
            </span>
            <span className="font-medium text-base">{sessionsPerWeek}</span>
          </Badge>
        )}
        {avgSessionTime && (
          <Badge
            variant="outline"
            size="lg"
            className="w-full justify-between py-2"
          >
            <span className="text-muted-foreground font-normal text-sm">
              Avg. time:
            </span>
            <span className="font-medium text-base">{avgSessionTime} min</span>
          </Badge>
        )}
        {formattedUserCount && (
          <Badge
            variant="outline"
            size="lg"
            className="w-full justify-between py-2"
          >
            <span className="text-muted-foreground font-normal text-sm">
              Users enrolled:
            </span>
            <span className="font-medium text-base">{formattedUserCount}</span>
          </Badge>
        )}
      </div>
    </div>
  )
}
