import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import MuscleGroupCategory from './model'

export const Query: GQLQueryResolvers = {
  muscleGroupCategories: async () => {
    const categories = await prisma.muscleGroupCategory.findMany()
    return categories.map((category) => new MuscleGroupCategory(category))
  },
  muscleGroupCategory: async (_, { id }) => {
    const category = await prisma.muscleGroupCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new Error('Muscle group category not found')
    }

    return new MuscleGroupCategory(category)
  },
}

export const Mutation: GQLMutationResolvers = {}
