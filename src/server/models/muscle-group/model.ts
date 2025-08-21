import { GQLMuscleGroup } from '@/generated/graphql-server'
import {
  MuscleGroup as PrismaMuscleGroup,
  MuscleGroupCategory as PrismaMuscleGroupCategory,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'
import MuscleGroupCategory from '../muscle-group-category/model'

export default class MuscleGroup implements GQLMuscleGroup {
  constructor(
    protected data: PrismaMuscleGroup & {
      category?: PrismaMuscleGroupCategory
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get alias() {
    return this.data.alias
  }

  get groupSlug() {
    return this.data.groupSlug
  }

  get isPrimary() {
    return this.data.isPrimary
  }

  async category() {
    const category = this.data.category
    if (category) {
      return new MuscleGroupCategory(category, this.context)
    } else {
      console.error(
        `[MuscleGroup] No category found for muscle group ${this.id}. Loading from database.`,
      )
      // Fallback to database query if category not included
      console.error(
        `[MuscleGroup] Making database query for category in muscle group ${this.id}. This could cause N+1 queries.`,
      )
      const categoryFromDb = await prisma.muscleGroupCategory.findUnique({
        where: {
          id: this.data.categoryId,
        },
      })

      if (!categoryFromDb) {
        throw null
      }

      return new MuscleGroupCategory(categoryFromDb, this.context)
    }
  }

  async exercises() {
    console.error(
      `[MuscleGroup] Making database query for exercises in muscle group ${this.id}. This could cause N+1 queries.`,
    )
    const exercises = await prisma.baseExercise.findMany({
      where: {
        muscleGroups: {
          some: {
            id: this.data.id,
          },
        },
      },
      include: {
        muscleGroups: {
          include: {
            category: true,
          },
        },
      },
    })

    return exercises.map((exercise) => new BaseExercise(exercise, this.context))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
