import { MUSCLES, getMusclesGroupedForGraphQL } from '@/config/muscles'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import MuscleGroup from './model'

export const Query: GQLQueryResolvers = {
  muscleGroups: async (_, __, context) => {
    return MUSCLES.map(
      (muscle) =>
        new MuscleGroup(
          {
            id: muscle.id,
            name: muscle.name,
            alias: muscle.alias,
            displayGroup: muscle.displayGroup,
          },
          context,
        ),
    )
  },
  muscleGroupCategories: async (_, __, context) => {
    const grouped = getMusclesGroupedForGraphQL()
    return grouped.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      muscles: category.muscles.map(
        (muscle) =>
          new MuscleGroup(
            {
              id: muscle.id,
              name: muscle.name,
              alias: muscle.alias,
              displayGroup: muscle.displayGroup,
            },
            context,
          ),
      ),
    }))
  },
}

export const Mutation: GQLMutationResolvers = {}
