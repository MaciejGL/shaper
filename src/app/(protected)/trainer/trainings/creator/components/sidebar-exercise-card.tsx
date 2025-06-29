import { FlameIcon, GaugeIcon, TimerIcon } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

import { TrainingExercise } from '../../../types'

import { EXERCISE_TYPES } from './utils'

type SidebarExercsesCardProps = {
  exercise:
    | GQLTrainerExercisesQuery['userExercises'][number]
    | GQLTrainerExercisesQuery['publicExercises'][number]
}

export const TrainingExerciseCard = React.memo(function TrainingExerciseCard({
  exercise,
}: {
  exercise: TrainingExercise
}) {
  return (
    <Card
      className="cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out min-h-[120px] select-none"
      hoverable
    >
      <CardContent className="grow p-3 flex flex-col gap-2 justify-between overflow-hidden cursor-pointer">
        {exercise.type && (
          <p className="text-xs  pr-6 text-muted-foreground">
            {EXERCISE_TYPES[exercise.type]}
          </p>
        )}
        <p className="text-sm font-medium pr-6 mb-4">{exercise.name}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {exercise.warmupSets && (
            <Badge variant="outline">
              <FlameIcon />
              {exercise.warmupSets} warmups
            </Badge>
          )}
          {exercise.sets.length > 0 && (
            <Badge variant="outline">
              <FlameIcon /> {exercise.sets.length} sets
            </Badge>
          )}
          {exercise.restSeconds && (
            <Badge variant="outline">
              <TimerIcon /> {exercise.restSeconds} rest
            </Badge>
          )}
          {exercise.tempo && (
            <Badge variant="outline">
              <GaugeIcon /> {exercise.tempo}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export const SidebarExercsesCard = React.memo(function SidebarExercsesCard({
  exercise,
}: SidebarExercsesCardProps) {
  return (
    <Card
      className="cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out"
      hoverable
    >
      <CardContent className="p-3 flex items-center justify-between">
        <p className="text-sm font-medium pr-6">{exercise.name}</p>
        <Badge variant="outline">
          {exercise.isPublic ? 'Public' : 'Private'}
        </Badge>
      </CardContent>
    </Card>
  )
})
