import { GraphQLError } from 'graphql'

import { GQLUserRole } from '@/generated/graphql-server'
import type { GQLEquipment } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'

type FitspaceCreateCustomExerciseArgs = {
  input: {
    name: string
    muscleGroupIds: string[]
    equipment?: GQLEquipment | null
  }
}

type FitspaceUpdateCustomExerciseArgs = {
  id: string
  input: {
    name: string
    muscleGroupIds: string[]
    equipment?: GQLEquipment | null
  }
}

type FitspaceDeleteCustomExerciseArgs = {
  id: string
}

async function requirePremiumIfClient(context: GQLContext) {
  const user = context.user?.user
  if (!user) throw new GraphQLError('Authentication required')

  if (user.role !== GQLUserRole.Client) return

  const hasPremium = await subscriptionValidator.hasPremiumAccess(user.id)
  if (!hasPremium) throw new GraphQLError('Premium required')
}

export const Mutation = {
  fitspaceCreateCustomExercise: async (
    _: unknown,
    { input }: FitspaceCreateCustomExerciseArgs,
    context: GQLContext,
  ) => {
    const user = context.user?.user
    if (!user) throw new GraphQLError('Authentication required')

    await requirePremiumIfClient(context)

    const name = input.name.trim()
    if (!name) throw new GraphQLError('Exercise name is required')
    if (input.muscleGroupIds.length === 0)
      throw new GraphQLError('Muscle group is required')

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: { id: { in: input.muscleGroupIds } },
      select: { id: true },
    })

    if (muscleGroups.length === 0) {
      throw new GraphQLError('Muscle group not found')
    }

    const exercise = await prisma.baseExercise.create({
      data: {
        name,
        isPublic: false,
        isPremium: false,
        instructions: [],
        tips: [],
        equipment: input.equipment ?? null,
        createdBy: {
          connect: { id: user.id },
        },
        muscleGroups: {
          connect: muscleGroups,
        },
      },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
        createdBy: true,
      },
    })

    return new BaseExercise(exercise, context)
  },

  fitspaceUpdateCustomExercise: async (
    _: unknown,
    { id, input }: FitspaceUpdateCustomExerciseArgs,
    context: GQLContext,
  ) => {
    const user = context.user?.user
    if (!user) throw new GraphQLError('Authentication required')

    await requirePremiumIfClient(context)

    const existing = await prisma.baseExercise.findFirst({
      where: { id, createdById: user.id },
      select: { id: true },
    })
    if (!existing) throw new GraphQLError('Exercise not found or access denied')

    const name = input.name.trim()
    if (!name) throw new GraphQLError('Exercise name is required')
    if (input.muscleGroupIds.length === 0)
      throw new GraphQLError('Muscle group is required')

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: { id: { in: input.muscleGroupIds } },
      select: { id: true },
    })
    if (muscleGroups.length === 0) {
      throw new GraphQLError('Muscle group not found')
    }

    const updated = await prisma.baseExercise.update({
      where: { id },
      data: {
        name,
        equipment: input.equipment ?? null,
        muscleGroups: {
          set: muscleGroups,
        },
        secondaryMuscleGroups: {
          set: [],
        },
      },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
        createdBy: true,
      },
    })

    return new BaseExercise(updated, context)
  },

  fitspaceDeleteCustomExercise: async (
    _: unknown,
    { id }: FitspaceDeleteCustomExerciseArgs,
    context: GQLContext,
  ) => {
    const user = context.user?.user
    if (!user) throw new GraphQLError('Authentication required')

    await requirePremiumIfClient(context)

    const exercise = await prisma.baseExercise.findFirst({
      where: { id, createdById: user.id },
      select: { id: true },
    })
    if (!exercise) throw new GraphQLError('Exercise not found or access denied')

    const trainingExerciseCount = await prisma.trainingExercise.count({
      where: { baseId: id },
    })
    if (trainingExerciseCount > 0) {
      throw new GraphQLError(
        `Cannot delete exercise. It is currently used in ${trainingExerciseCount} training plan${trainingExerciseCount === 1 ? '' : 's'}. Please remove it from all training plans before deleting.`,
      )
    }

    await prisma.baseExercise.delete({ where: { id } })
    return true
  },
}
