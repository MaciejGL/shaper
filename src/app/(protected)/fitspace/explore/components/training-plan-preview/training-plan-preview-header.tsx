import { Crown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

import { HeroImage } from '../workout-day-preview/workout-day-preview'

interface TrainingPlanPreviewHeaderProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
}

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

export function TrainingPlanPreviewHeader({
  plan,
}: TrainingPlanPreviewHeaderProps) {
  const trainerName =
    plan.createdBy?.firstName ||
    `${plan.createdBy?.firstName || ''} ${plan.createdBy?.lastName || ''}`.trim() ||
    'Unknown Trainer'
  return (
    <div className="flex-shrink-0 relative overflow-hidden dark">
      {/* Hero image background */}
      {plan.heroImageUrl && (
        <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${plan.heroImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-semibold mb-2">{plan.title}</h2>
            <div className="flex justify-between gap-1 text-white/80">
              {plan.difficulty && (
                <Badge
                  variant={
                    difficultyVariantMap[
                      plan.difficulty as keyof typeof difficultyVariantMap
                    ]
                  }
                >
                  {plan.difficulty}
                </Badge>
              )}
              <span className="text-sm">by {trainerName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
