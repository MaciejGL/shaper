import { Crown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { GQLGetPublicTrainingPlansQuery } from '@/generated/graphql-client'

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
  return (
    <div className="border-b flex-shrink-0 relative overflow-hidden">
      {/* Hero image background */}
      {plan.heroImageUrl && (
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${plan.heroImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        </div>
      )}

      <div className={`p-4 relative ${plan.heroImageUrl ? 'dark' : ''}`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {plan.title}
              </h2>
              <div className="flex items-center gap-2">
                {plan.premium ? (
                  <Badge variant="premium">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free</Badge>
                )}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
