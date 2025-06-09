import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import MuscleGroupCategory from './model'

export const Query: GQLQueryResolvers = {
  muscleGroupCategories: async (_, __, context) => {
    const categories = await prisma.muscleGroupCategory.findMany()
    return categories.map(
      (category) => new MuscleGroupCategory(category, context),
    )
  },
  muscleGroupCategory: async (_, { id }, context) => {
    const category = await prisma.muscleGroupCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new Error('Muscle group category not found')
    }

    return new MuscleGroupCategory(category, context)
  },
}

export const Mutation: GQLMutationResolvers = {}
