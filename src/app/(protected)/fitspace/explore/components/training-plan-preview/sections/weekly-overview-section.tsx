import { ChevronRight } from 'lucide-react'

import { StatsItem } from '@/components/stats-item'
import { GQLGetPublicTrainingPlanWeeksQuery } from '@/generated/graphql-client'

interface WeeklyOverviewSectionProps {
  weeksData?: GQLGetPublicTrainingPlanWeeksQuery
  onWeekClick: (weekId: string) => void
}

export function WeeklyOverviewSection({
  weeksData,
  onWeekClick,
}: WeeklyOverviewSectionProps) {
  if (
    !weeksData?.getTrainingPlanById?.weeks ||
    weeksData.getTrainingPlanById.weeks.length === 0
  ) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Weekly Overview</h3>
      <div className="grid grid-cols-2 gap-2">
        {weeksData.getTrainingPlanById.weeks
          .slice()
          .sort((a, b) => a.weekNumber - b.weekNumber)
          .map((week) => (
            <button
              key={week.id}
              onClick={() => onWeekClick(week.id)}
              className="text-left hover:bg-accent/50 transition-colors rounded-lg"
            >
              <StatsItem
                label={`${week.days.filter((day) => !day.isRestDay).length} days`}
                iconPosition="right"
                icon={
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                }
                value={`Week ${week.weekNumber}`}
              />
            </button>
          ))}
      </div>
    </div>
  )
}
