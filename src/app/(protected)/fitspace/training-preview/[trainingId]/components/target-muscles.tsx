import { sortBy } from 'lodash'

import { Badge } from '@/components/ui/badge'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

type TargetMusclesProps = {
  plan: GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById']
}

export function TargetMuscles({ plan }: TargetMusclesProps) {
  const allMuscles = plan.weeks.flatMap((week) =>
    week.days.flatMap((day) =>
      day.exercises.flatMap((exercise) =>
        exercise.muscleGroups.map((mg) => mg.groupSlug),
      ),
    ),
  )
  const uniqueMuscles = sortBy(
    Array.from(new Set(allMuscles)),
    (muscle) => muscle,
  )

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Primary Muscles</h2>

      <div className="flex flex-wrap gap-2">
        {uniqueMuscles.map((muscle) => (
          <Badge
            key={muscle}
            variant="secondary"
            size="lg"
            className="capitalize"
          >
            {muscle}
          </Badge>
        ))}
      </div>
    </div>
  )
}
