'use client'

import { useUser } from '@/context/user-context'
import { useGetExerciseProgressQuery } from '@/generated/graphql-client'

import type { ExerciseProgressItem } from './types'

export function useExerciseStatsQuery({
  baseExerciseId,
  open,
}: {
  baseExerciseId: string
  open: boolean
}): {
  exercise: ExerciseProgressItem | undefined
  isLoading: boolean
} {
  const { user } = useUser()

  const { data, isLoading } = useGetExerciseProgressQuery(
    { userId: user?.id || '', exerciseId: baseExerciseId },
    {
      enabled: open && !!user?.id && !!baseExerciseId,
      select: (resp) => ({
        ...resp,
        exercisesProgressByUser: resp.exercisesProgressByUser.slice(0, 1),
      }),
    },
  )

  return {
    exercise: data?.exercisesProgressByUser[0],
    isLoading,
  }
}

