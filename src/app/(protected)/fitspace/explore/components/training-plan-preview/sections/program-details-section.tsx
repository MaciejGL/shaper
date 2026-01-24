import { StatsItem } from '@/components/stats-item'

interface ProgramDetailsSectionProps {
  weekCount: number
  sessionsPerWeek?: number | null
  avgSessionTime?: number | null
}

export function ProgramDetailsSection({
  weekCount,
  sessionsPerWeek,
  avgSessionTime,
}: ProgramDetailsSectionProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatsItem variant="outline" label="Weeks" value={weekCount} />
      <StatsItem
        variant="outline"
        label="Sessions / week"
        value={sessionsPerWeek}
      />
      <StatsItem variant="outline" label="Avg. time" value={avgSessionTime} />
    </div>
  )
}
