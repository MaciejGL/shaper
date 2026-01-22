import { useQueryClient } from '@tanstack/react-query'

import type { HighLevelGroup } from '@/config/muscles'
import {
  type GQLEquipment,
  type GQLFitspaceCreateCustomExerciseMutation,
  type GQLFitspaceDeleteCustomExerciseMutation,
  type GQLFitspaceGetExercisesQuery,
  type GQLFitspaceUpdateCustomExerciseMutation,
  useFitspaceCreateCustomExerciseMutation,
  useFitspaceDeleteCustomExerciseMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceUpdateCustomExerciseMutation,
} from '@/generated/graphql-client'
import { generateTempId, useOptimisticMutation } from '@/lib/optimistic-mutations'

import { mapHighLevelGroupToMuscleIds } from './utils'
import type { MuscleGroupCategories } from './types'
import { HIGH_LEVEL_TO_DISPLAY_GROUPS } from '@/config/muscles'

export function useCustomExerciseMutations({
  categories,
  userId,
}: {
  categories: MuscleGroupCategories | undefined
  userId: string | undefined
}) {
  const queryClient = useQueryClient()
  const queryKey = useFitspaceGetExercisesQuery.getKey()

  const createMutation = useFitspaceCreateCustomExerciseMutation()
  const updateMutation = useFitspaceUpdateCustomExerciseMutation()
  const deleteMutation = useFitspaceDeleteCustomExerciseMutation()

  const create = useOptimisticMutation<
    GQLFitspaceGetExercisesQuery,
    GQLFitspaceCreateCustomExerciseMutation,
    { name: string; highLevelGroup: HighLevelGroup; equipment: GQLEquipment | null }
  >({
    queryKey,
    mutationFn: async ({ name, highLevelGroup, equipment }) => {
      const muscleGroupIds = mapHighLevelGroupToMuscleIds({
        categories,
        highLevelGroup,
      })
      return createMutation.mutateAsync({
        input: { name, muscleGroupIds, equipment },
      })
    },
    updateFn: (oldData, variables, tempId) => {
      if (!oldData.getExercises || !tempId || !userId) return oldData

      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[variables.highLevelGroup]
      const muscles = categories?.flatMap((c) => c?.muscles ?? []) ?? []
      const muscleGroups = muscles
        .filter((m) => (m?.id ? displayGroups.includes(m.displayGroup) : false))
        .map((m) => ({
          id: m.id,
          alias: m.alias,
          displayGroup: m.displayGroup,
        }))

      const nextExercise = {
        id: tempId,
        name: variables.name,
        description: null,
        videoUrl: null,
        equipment: variables.equipment,
        isPublic: false,
        createdById: userId,
        instructions: [],
        tips: [],
        difficulty: null,
        images: [],
        muscleGroups,
        secondaryMuscleGroups: [],
      }

      return {
        ...oldData,
        getExercises: {
          ...oldData.getExercises,
          userExercises: [
            nextExercise,
            ...(oldData.getExercises.userExercises ?? []),
          ],
        },
      }
    },
    onSuccess: (data, _variables, tempId) => {
      if (!tempId) return

      const created = data.fitspaceCreateCustomExercise
      queryClient.setQueryData<GQLFitspaceGetExercisesQuery>(queryKey, (old) => {
        if (!old?.getExercises) return old
        return {
          ...old,
          getExercises: {
            ...old.getExercises,
            userExercises: (old.getExercises.userExercises ?? []).map((ex) =>
              ex.id === tempId ? created : ex,
            ),
          },
        }
      })
    },
  })

  const update = useOptimisticMutation<
    GQLFitspaceGetExercisesQuery,
    GQLFitspaceUpdateCustomExerciseMutation,
    {
      id: string
      name: string
      highLevelGroup: HighLevelGroup
      equipment: GQLEquipment | null
    }
  >({
    queryKey,
    mutationFn: async ({ id, name, highLevelGroup, equipment }) => {
      const muscleGroupIds = mapHighLevelGroupToMuscleIds({
        categories,
        highLevelGroup,
      })
      return updateMutation.mutateAsync({
        id,
        input: { name, muscleGroupIds, equipment },
      })
    },
    updateFn: (oldData, variables) => {
      if (!oldData.getExercises) return oldData
      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[variables.highLevelGroup]
      const muscles = categories?.flatMap((c) => c?.muscles ?? []) ?? []
      const muscleGroups = muscles
        .filter((m) => (m?.id ? displayGroups.includes(m.displayGroup) : false))
        .map((m) => ({
          id: m.id,
          alias: m.alias,
          displayGroup: m.displayGroup,
        }))

      return {
        ...oldData,
        getExercises: {
          ...oldData.getExercises,
          userExercises: (oldData.getExercises.userExercises ?? []).map((ex) =>
            ex.id === variables.id
              ? {
                  ...ex,
                  name: variables.name,
                  equipment: variables.equipment,
                  muscleGroups,
                }
              : ex,
          ),
        },
      }
    },
    onSuccess: (data) => {
      const updated = data.fitspaceUpdateCustomExercise
      queryClient.setQueryData<GQLFitspaceGetExercisesQuery>(queryKey, (old) => {
        if (!old?.getExercises) return old
        return {
          ...old,
          getExercises: {
            ...old.getExercises,
            userExercises: (old.getExercises.userExercises ?? []).map((ex) =>
              ex.id === updated.id ? updated : ex,
            ),
          },
        }
      })
    },
  })

  const remove = useOptimisticMutation<
    GQLFitspaceGetExercisesQuery,
    GQLFitspaceDeleteCustomExerciseMutation,
    { id: string }
  >({
    queryKey,
    mutationFn: async ({ id }) => {
      return deleteMutation.mutateAsync({ id })
    },
    updateFn: (oldData, variables) => {
      if (!oldData.getExercises) return oldData

      return {
        ...oldData,
        getExercises: {
          ...oldData.getExercises,
          userExercises: (oldData.getExercises.userExercises ?? []).filter(
            (ex) => ex.id !== variables.id,
          ),
        },
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    create: async (variables: {
      name: string
      highLevelGroup: HighLevelGroup
      equipment: GQLEquipment | null
    }) =>
      create.optimisticMutate(variables, generateTempId('exercise')),
    update: update.optimisticMutate,
    remove: remove.optimisticMutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

