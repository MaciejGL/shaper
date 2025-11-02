import {
  GQLGetPublicTrainingPlanWeeksQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'
import { formatUserCount } from '@/utils/format-user-count'

import { DescriptionSection } from './sections/description-section'
// import { EquipmentSection } from './sections/equipment-section'
import { FocusTagsSection } from './sections/focus-tags-section'
import { ProgramDetailsSection } from './sections/program-details-section'
import { TargetGoalsSection } from './sections/target-goals-section'
import { WeeklyOverviewSection } from './sections/weekly-overview-section'

interface TrainingPlanPreviewInfoTabProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  weeksData?: GQLGetPublicTrainingPlanWeeksQuery
  onWeekClick: (weekId: string) => void
}

export function TrainingPlanPreviewInfoTab({
  plan,
  weeksData,
  onWeekClick,
}: TrainingPlanPreviewInfoTabProps) {
  const formattedUserCount = formatUserCount(plan.assignmentCount)

  return (
    <div className="space-y-8">
      <ProgramDetailsSection
        weekCount={plan.weekCount}
        formattedUserCount={formattedUserCount}
        sessionsPerWeek={plan.sessionsPerWeek}
        avgSessionTime={plan.avgSessionTime}
      />
      <TargetGoalsSection targetGoals={plan.targetGoals || []} />
      <FocusTagsSection focusTags={plan.focusTags || []} />
      {/* <EquipmentSection equipment={plan.equipment || []} /> */}

      <WeeklyOverviewSection weeksData={weeksData} onWeekClick={onWeekClick} />
      {plan.description && (
        <DescriptionSection description={plan.description} />
      )}
    </div>
  )
}
