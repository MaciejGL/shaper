import {
  MuscleGroup as PrismaMuscleGroup,
  MuscleGroupCategory as PrismaMuscleGroupCategory,
} from '@prisma/client'

import { GQLMuscleGroupCategory } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import MuscleGroup from '../muscle-group/model'

export default class MuscleGroupCategory implements GQLMuscleGroupCategory {
  constructor(
    protected data: PrismaMuscleGroupCategory & {
      muscles?: PrismaMuscleGroup[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get slug() {
    return this.data.slug
  }

  async muscles() {
    const muscles = this.data.muscles
    if (muscles) {
      return muscles.map(
        (muscle) =>
          new MuscleGroup({ ...muscle, category: this.data }, this.context),
      )
    } else {
      console.error(
        `[MuscleGroupCategory] No muscles found for category ${this.id}. Loading from database.`,
      )
      // Fallback to database query if muscles not included
      const musclesFromDb = await prisma.muscleGroup.findMany({
        where: {
          categoryId: this.data.id,
        },
      })
      return musclesFromDb.map(
        (muscle) =>
          new MuscleGroup({ ...muscle, category: this.data }, this.context),
      )
    }
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
