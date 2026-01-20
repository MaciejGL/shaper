'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CheckCheck, RotateCcw } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useCallback } from 'react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Button } from '@/components/ui/button'
import type {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  GQLFitspaceMarkExerciseAsCompletedMutation,
} from '@/generated/graphql-client'
import {
  useFitspaceGetWorkoutDayQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

interface MarkDayAsCompletedButtonProps {
  day: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
}

export function MarkDayAsCompletedButton({
  day,
}: MarkDayAsCompletedButtonProps) {
  const queryClient = useQueryClient()
  const { openModal } = useConfirmationModalContext()
  const [dayIdFromUrl] = useQueryState('day')
  const dayId = dayIdFromUrl ?? day.id

  const { mutateAsync: markExerciseAsCompleted, isPending } =
    useFitspaceMarkExerciseAsCompletedMutation()

  const incompleteExerciseIds = day.exercises
    .filter((ex) => !(ex.substitutedBy?.completedAt ?? ex.completedAt))
    .map((ex) => ex.substitutedBy?.id || ex.id)

  const allExerciseIds = day.exercises.map(
    (ex) => ex.substitutedBy?.id || ex.id,
  )
  const allExercisesCompleted = incompleteExerciseIds.length === 0

  const { optimisticMutate: markAllExercisesCompletedOptimistic } =
    useOptimisticMutation<
      GQLFitspaceGetWorkoutDayQuery,
      GQLFitspaceMarkExerciseAsCompletedMutation[],
      { exerciseIds: string[]; completed: boolean }
    >({
      queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
      mutationFn: async ({ exerciseIds, completed }) => {
        return Promise.all(
          exerciseIds.map((exerciseId) =>
            markExerciseAsCompleted({ exerciseId, completed }),
          ),
        )
      },
      updateFn: (oldData, { exerciseIds, completed }) => {
        if (!oldData?.getWorkoutDay?.day) return oldData

        const newData = JSON.parse(
          JSON.stringify(oldData),
        ) as NonNullable<GQLFitspaceGetWorkoutDayQuery>
        if (!newData.getWorkoutDay?.day) return newData

        const nowIso = new Date().toISOString()
        const ids = new Set(exerciseIds)

        newData.getWorkoutDay.day.exercises.forEach((exercise) => {
          const targetExerciseId = exercise.substitutedBy?.id || exercise.id
          if (!ids.has(targetExerciseId)) return

          const exerciseToUpdate = exercise.substitutedBy || exercise
          const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets

          exerciseToUpdate.completedAt = completed ? nowIso : null
          setsToUpdate.forEach((set) => {
            set.completedAt = completed ? nowIso : null
          })
        })

        if (!completed) {
          newData.getWorkoutDay.day.completedAt = null
          return newData
        }

        const isDayNowCompleted = newData.getWorkoutDay.day.exercises.every(
          (ex) => ex.substitutedBy?.completedAt ?? ex.completedAt,
        )
        newData.getWorkoutDay.day.completedAt = isDayNowCompleted
          ? nowIso
          : null

        return newData
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['navigation'] })
      },
      onError: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['navigation'] }),
          queryClient.invalidateQueries({
            queryKey: useFitspaceGetWorkoutDayQuery.getKey({ dayId }),
          }),
        ])
      },
    })

  const handleConfirm = useCallback(async () => {
    const nowIso = new Date().toISOString()
    const shouldComplete = !allExercisesCompleted
    const exerciseIdsToUpdate = shouldComplete
      ? incompleteExerciseIds
      : allExerciseIds

    if (exerciseIdsToUpdate.length === 0) return

    const previousNavigation =
      queryClient.getQueryData<GQLFitspaceGetWorkoutNavigationQuery>([
        'navigation',
      ])

    queryClient.setQueryData(
      ['navigation'],
      (old: GQLFitspaceGetWorkoutNavigationQuery | undefined) => {
        if (!old?.getWorkoutNavigation?.plan) return old
        return {
          ...old,
          getWorkoutNavigation: {
            ...old.getWorkoutNavigation,
            plan: {
              ...old.getWorkoutNavigation.plan,
              weeks: old.getWorkoutNavigation.plan.weeks.map((week) => ({
                ...week,
                days: week.days.map((navDay) =>
                  navDay.id === dayId
                    ? { ...navDay, completedAt: shouldComplete ? nowIso : null }
                    : navDay,
                ),
              })),
            },
          },
        }
      },
    )

    try {
      await markAllExercisesCompletedOptimistic({
        exerciseIds: exerciseIdsToUpdate,
        completed: shouldComplete,
      })
    } catch (error) {
      queryClient.setQueryData(['navigation'], previousNavigation)
      throw error
    }
  }, [
    allExerciseIds,
    allExercisesCompleted,
    dayId,
    incompleteExerciseIds,
    markAllExercisesCompletedOptimistic,
    queryClient,
  ])

  const handleClick = () => {
    openModal({
      title: allExercisesCompleted
        ? 'Unmark day as completed?'
        : 'Mark day as completed?',
      description: allExercisesCompleted
        ? "This will mark all exercises as not completed.\n\nIt won't delete any reps/weight logs you already entered."
        : "This will mark all exercises as completed.\n\nIt won't create missing reps/weight logs — only what you already have in written in sets.",
      confirmText: allExercisesCompleted
        ? 'Unmark as completed'
        : 'Mark as completed',
      cancelText: 'Cancel',
      onConfirm: handleConfirm,
    })
  }

  if (day.exercises.length === 0) return null

  return (
    <Button
      variant="secondary"
      size="md"
      iconStart={allExercisesCompleted ? <RotateCcw /> : <CheckCheck />}
      className="flex-1"
      onClick={handleClick}
      disabled={isPending}
      loading={isPending}
    >
      {allExercisesCompleted ? 'Unmark day' : 'Complete day'}
    </Button>
  )
}
