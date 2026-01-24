import { ChevronRight } from 'lucide-react'

import { StatsItem } from '@/components/stats-item'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

interface WeeklyOverviewSectionProps {
  weeksData?: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onWeekClick: (weekId: string) => void
}

export function WeeklyOverviewSection({
  weeksData,
  onWeekClick,
}: WeeklyOverviewSectionProps) {
  if (!weeksData?.weeks || weeksData.weeks.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-2 text-base">Weekly Overview</h3>
      <div className="grid grid-cols-2 gap-2">
        {weeksData.weeks
          .slice()
          .sort((a, b) => a.weekNumber - b.weekNumber)
          .map((week) => (
            <button
              key={week.id}
              onClick={() => onWeekClick(week.id)}
              className="text-left hover:bg-accent/50 transition-colors rounded-lg"
            >
              <StatsItem
                label={`${week.days.filter((day) => !day.isRestDay).length} sessions`}
                iconPosition="right"
                icon={
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                }
                variant="outline"
                value={`Week ${week.weekNumber}`}
                classNameValue="font-semibold text-sm"
                className="px-5 bg-card-on-card"
              />
            </button>
          ))}
      </div>
    </div>
  )
}
