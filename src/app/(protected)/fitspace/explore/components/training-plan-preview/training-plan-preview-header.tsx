import { TrainingPlanHeroHeader } from '@/components/training-plan-hero-header'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

interface TrainingPlanPreviewHeaderProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  hideCloseButton?: boolean
}

export function TrainingPlanPreviewHeader({
  plan,
  hideCloseButton = false,
}: TrainingPlanPreviewHeaderProps) {
  const trainerName =
    plan.createdBy?.firstName ||
    `${plan.createdBy?.firstName || ''} ${plan.createdBy?.lastName || ''}`.trim() ||
    'Unknown Trainer'

  return (
    <TrainingPlanHeroHeader
      title={plan.title}
      imageUrl={plan.heroImageUrl ?? null}
      difficulty={(plan.difficulty as Difficulty) ?? null}
      createdByName={trainerName}
      hideCloseButton={hideCloseButton}
    />
  )
}
