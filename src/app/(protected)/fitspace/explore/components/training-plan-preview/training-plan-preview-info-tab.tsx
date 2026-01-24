import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

import { CreatorSection } from './sections/creator-section'
import { DescriptionSection } from './sections/description-section'
// import { EquipmentSection } from './sections/equipment-section'
import { FocusTagsSection } from './sections/focus-tags-section'
import { ProgramDetailsSection } from './sections/program-details-section'
import { TargetGoalsSection } from './sections/target-goals-section'
import { WeeklyOverviewSection } from './sections/weekly-overview-section'

interface TrainingPlanPreviewInfoTabProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  weeksData?: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onWeekClick: (weekId: string) => void
  onCreatorClick?: () => void
}

export function TrainingPlanPreviewInfoTab({
  plan,
  weeksData,
  onWeekClick,
  onCreatorClick,
}: TrainingPlanPreviewInfoTabProps) {
  return (
    <div className="space-y-6">
      <ProgramDetailsSection
        weekCount={plan.weekCount}
        sessionsPerWeek={plan.sessionsPerWeek}
        avgSessionTime={plan.avgSessionTime}
      />
      <TargetGoalsSection targetGoals={plan.targetGoals || []} />
      <FocusTagsSection focusTags={plan.focusTags || []} />

      <WeeklyOverviewSection weeksData={weeksData} onWeekClick={onWeekClick} />
      {plan.description && (
        <DescriptionSection description={plan.description} />
      )}
      {plan.createdBy ? (
        <CreatorSection creator={plan.createdBy} onClick={onCreatorClick} />
      ) : null}
    </div>
  )
}
