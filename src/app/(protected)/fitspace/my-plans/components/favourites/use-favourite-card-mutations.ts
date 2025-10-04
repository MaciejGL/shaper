import { DragEndEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import {
  GQLGetFavouriteWorkoutsQuery,
  useRemoveFavouriteExerciseMutation,
  useUpdateFavouriteExerciseSetsMutation,
  useUpdateFavouriteExercisesOrderMutation,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'

type FavouriteExercise = NonNullable<
  NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]['exercises']
>[number]

interface UseFavouriteCardMutationsProps {
  favouriteId: string
  exercises: FavouriteExercise[]
}

export function useFavouriteCardMutations({
  favouriteId,
  exercises,
}: UseFavouriteCardMutationsProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateExerciseSets } =
    useUpdateFavouriteExerciseSetsMutation()
  const { mutateAsync: removeExercise } = useRemoveFavouriteExerciseMutation()
  const { mutateAsync: updateExercisesOrder } =
    useUpdateFavouriteExercisesOrderMutation()

  const queryKey = useMemo(() => ['GetFavouriteWorkouts'], [])

  // Optimistic mutation for updating set counts
  const { optimisticMutate: updateSetCountOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    unknown,
    { exerciseId: string; setCount: number }
  >({
    queryKey,
    mutationFn: ({ exerciseId, setCount }) =>
      updateExerciseSets({ exerciseId, setCount }),
    updateFn: (oldData, { exerciseId, setCount }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
          if (fav.id !== favouriteId) return fav

          return {
            ...fav,
            exercises: fav.exercises.map((ex) => {
              if (ex.id !== exerciseId) return ex

              const currentSetCount = ex.sets.length

              if (setCount > currentSetCount) {
                const setsToAdd = setCount - currentSetCount
                const lastSet = ex.sets[ex.sets.length - 1]
                const maxOrder =
                  ex.sets.length > 0
                    ? Math.max(...ex.sets.map((s) => s.order))
                    : 0

                const newSets = Array.from({ length: setsToAdd }, (_, i) => ({
                  id: `temp-${Date.now()}-${i}`,
                  order: maxOrder + i + 1,
                  reps: lastSet?.reps || null,
                  minReps: lastSet?.minReps || null,
                  maxReps: lastSet?.maxReps || null,
                  weight: lastSet?.weight || null,
                  rpe: lastSet?.rpe || null,
                }))

                return {
                  ...ex,
                  sets: [...ex.sets, ...newSets],
                }
              } else if (setCount < currentSetCount) {
                return {
                  ...ex,
                  sets: ex.sets.slice(0, setCount),
                }
              }

              return ex
            }),
          }
        }),
      }
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  // Optimistic mutation for removing an exercise
  const { optimisticMutate: removeExerciseOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    unknown,
    { exerciseId: string }
  >({
    queryKey,
    mutationFn: ({ exerciseId }) => removeExercise({ exerciseId }),
    updateFn: (oldData, { exerciseId }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
          if (fav.id !== favouriteId) return fav

          return {
            ...fav,
            exercises: fav.exercises.filter((ex) => ex.id !== exerciseId),
          }
        }),
      }
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  // Optimistic mutation for reordering exercises
  const { optimisticMutate: reorderExercisesOptimistic } =
    useOptimisticMutation<
      GQLGetFavouriteWorkoutsQuery,
      unknown,
      {
        reorderedExercises: typeof exercises
        exerciseOrders: { exerciseId: string; order: number }[]
      }
    >({
      queryKey,
      mutationFn: ({ exerciseOrders }) =>
        updateExercisesOrder({ favouriteId, exerciseOrders }),
      updateFn: (oldData, { reorderedExercises }) => {
        if (!oldData?.getFavouriteWorkouts) return oldData

        return {
          ...oldData,
          getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
            if (fav.id !== favouriteId) return fav

            return {
              ...fav,
              exercises: reorderedExercises,
            }
          }),
        }
      },
      onError: async () => {
        await queryClient.invalidateQueries({ queryKey })
      },
    })

  // Handle adding a set to an exercise
  const handleAddSet = useCallback(
    (exerciseId: string) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return

      const newSetCount = exercise.sets.length + 1
      updateSetCountOptimistic({ exerciseId, setCount: newSetCount })
    },
    [exercises, updateSetCountOptimistic],
  )

  // Handle removing a set from an exercise
  const handleRemoveSet = useCallback(
    (exerciseId: string) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId)
      if (!exercise || exercise.sets.length <= 1) return

      const newSetCount = exercise.sets.length - 1
      updateSetCountOptimistic({ exerciseId, setCount: newSetCount })
    },
    [exercises, updateSetCountOptimistic],
  )

  // Handle removing an exercise
  const handleRemoveExercise = useCallback(
    (exerciseId: string) => {
      removeExerciseOptimistic({ exerciseId })
    },
    [removeExerciseOptimistic],
  )

  // Handle drag end for reordering exercises
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) return

      const oldIndex = exercises.findIndex((ex) => ex.id === active.id)
      const newIndex = exercises.findIndex((ex) => ex.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      // Create a new array with reordered exercises
      const reorderedExercises = [...exercises]
      const [movedExercise] = reorderedExercises.splice(oldIndex, 1)
      reorderedExercises.splice(newIndex, 0, movedExercise)

      // Create exercise orders array (only IDs and new order values)
      const exerciseOrders = reorderedExercises.map((ex, index) => ({
        exerciseId: ex.id,
        order: index + 1,
      }))

      reorderExercisesOptimistic({
        reorderedExercises,
        exerciseOrders,
      })
    },
    [exercises, reorderExercisesOptimistic],
  )

  return {
    handleAddSet,
    handleRemoveSet,
    handleRemoveExercise,
    handleDragEnd,
  }
}
