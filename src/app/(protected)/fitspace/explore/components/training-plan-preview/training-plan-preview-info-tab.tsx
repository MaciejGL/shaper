import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  hasDemoWorkoutDay?: boolean
  onTryDemoWorkoutDay?: () => void
}

export function TrainingPlanPreviewInfoTab({
  plan,
  weeksData,
  onWeekClick,
  onCreatorClick,
  hasDemoWorkoutDay = false,
  onTryDemoWorkoutDay,
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

      {hasDemoWorkoutDay && (
        <Card variant="highlighted" className="dark shadow-xl">
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="font-semibold">Start a preview session</p>
              <p className="text-sm text-muted-foreground">
                Try one full workout day from this plan before committing.
              </p>
            </div>
            <Button
              className="w-full mt-4"
              variant="default"
              onClick={onTryDemoWorkoutDay}
            >
              View and start preview session
            </Button>
          </CardContent>
        </Card>
      )}

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
