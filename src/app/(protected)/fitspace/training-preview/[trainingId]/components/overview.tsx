import { Calendar, Dumbbell, Target, Users } from 'lucide-react'

import { StatsItem } from '@/components/stats-item'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

type OverviewProps = {
  plan: Pick<
    GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById'],
    | 'description'
    | 'weekCount'
    | 'totalWorkouts'
    | 'difficulty'
    | 'totalReviews'
    | 'assignedCount'
  >
}

export function Overview({ plan }: OverviewProps) {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-bold">Program Overview</h2>
      </div>
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted p-4 rounded-lg">
          <StatsItem
            value={plan.weekCount}
            label="Weeks"
            icon={<Calendar className="size-5 text-amber-500" />}
            iconPosition="top"
          />
          <StatsItem
            value={Math.round(plan.totalWorkouts / plan.weekCount)}
            label="Workouts weekly"
            icon={<Dumbbell className="size-5 text-blue-500" />}
            iconPosition="top"
          />
          <StatsItem
            value={plan.assignedCount}
            label="Users"
            icon={<Users className="size-5 text-green-500" />}
            iconPosition="top"
          />
          <StatsItem
            value={
              <p className="text-lg font-bold text-primary capitalize">
                {plan.difficulty.toLowerCase()}
              </p>
            }
            label="Level"
            icon={<Target className="size-5 text-violet-500" />}
            iconPosition="top"
          />
        </div>
      </div>
    </div>
  )
}
