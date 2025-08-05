import { FlameIcon, GaugeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'

interface ExerciseMetadataProps {
  exercise: WorkoutContextPlan['weeks'][number]['days'][number]['exercises'][number]
}

export function ExerciseMetadata({ exercise }: ExerciseMetadataProps) {
  const hasMetadata = exercise.warmupSets || exercise.tempo

  if (!hasMetadata) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {exercise.warmupSets && (
        <Badge variant="secondary" className="text-xs">
          <FlameIcon className="w-3 h-3 mr-1 text-amber-500" />
          {exercise.warmupSets} warmup
          {exercise.warmupSets > 1 ? 's' : ''}
        </Badge>
      )}

      {exercise.tempo && (
        <Badge variant="secondary" className="text-xs">
          <GaugeIcon className="w-3 h-3 mr-1 text-green-500" />
          {exercise.tempo} tempo
        </Badge>
      )}
    </div>
  )
}
