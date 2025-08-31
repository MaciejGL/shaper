import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import MuscleGroupCategory from './model'

export const Query: GQLQueryResolvers = {
  muscleGroupCategories: async (_, __, context) => {
    // Preload all muscles to prevent N+1 queries
    const categories = await prisma.muscleGroupCategory.findMany({
      include: {
        muscles: true,
      },
    })
    return categories.map(
      (category) => new MuscleGroupCategory(category, context),
    )
  },
  muscleGroupCategory: async (_, { id }, context) => {
    const category = await prisma.muscleGroupCategory.findUnique({
      where: { id },
      include: {
        muscles: true,
      },
    })

    if (!category) {
      throw new Error('Muscle group category not found')
    }

    return new MuscleGroupCategory(category, context)
  },
}

export const Mutation: GQLMutationResolvers = {}
