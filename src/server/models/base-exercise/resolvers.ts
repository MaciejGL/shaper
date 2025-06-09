import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  userExercises: async (_, { where }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const whereClause: Prisma.BaseExerciseWhereInput = {
      createdBy: {
        id: user.user.id,
      },
    }

    if (where?.equipment) {
      whereClause.equipment = where.equipment
    }

    if (where?.muscleGroups) {
      whereClause.muscleGroups = {
        some: {
          id: { in: where.muscleGroups },
        },
      }
    }

    const exercises = await prisma.baseExercise.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        muscleGroups: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!exercises.length) {
      return []
    }

    return exercises.map((exercise) => new BaseExercise(exercise))
  },
  publicExercises: async (_, { where }) => {
    const whereClause: Prisma.BaseExerciseWhereInput = {
      createdBy: null,
      isPublic: true,
    }

    if (where?.equipment) {
      whereClause.equipment = where.equipment
    }

    if (where?.muscleGroups) {
      whereClause.muscleGroups = {
        some: {
          id: { in: where.muscleGroups },
        },
      }
    }

    const exercises = await prisma.baseExercise.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
      include: {
        muscleGroups: {
          include: {
            category: true,
          },
        },
      },
    })

    return exercises.map((exercise) => new BaseExercise(exercise))
  },
  exercise: async (_, { id }) => {
    const exercise = await prisma.baseExercise.findUnique({
      where: { id },
      include: {
        muscleGroups: {
          include: {
            category: true,
          },
        },
      },
    })

    return exercise ? new BaseExercise(exercise) : null
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createExercise: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        id: { in: input.muscleGroups },
      },
    })
    await prisma.baseExercise.create({
      data: {
        name: input.name,
        description: input.description,
        videoUrl: input.videoUrl,
        equipment: input.equipment,
        muscleGroups: {
          connect: muscleGroups.map((mg) => ({ id: mg.id })),
        },
        createdBy: {
          connect: {
            id: user.user.id,
          },
        },
      },
    })

    return true
  },
  updateExercise: async (_, { id, input }) => {
    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        id: { in: input.muscleGroups ?? [] },
      },
    })

    await prisma.baseExercise.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        videoUrl: input.videoUrl,
        equipment: input.equipment,
        muscleGroups: {
          connect: muscleGroups.map((mg) => ({ id: mg.id })),
        },
      },
    })

    return true
  },
  deleteExercise: async (_, { id }) => {
    await prisma.baseExercise.delete({
      where: { id },
    })

    return true
  },
}
