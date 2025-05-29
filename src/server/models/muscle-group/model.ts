import { MuscleGroup as PrismaMuscleGroup } from '@prisma/client'

import { GQLMuscleGroup } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import BaseExercise from '../base-exercise/model'
import MuscleGroupCategory from '../muscle-group-category/model'

export default class MuscleGroup implements GQLMuscleGroup {
  constructor(protected data: PrismaMuscleGroup) {}

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
    const category = await prisma.muscleGroupCategory.findUnique({
      where: {
        id: this.data.categoryId,
      },
    })

    if (!category) {
      throw null
    }

    return new MuscleGroupCategory(category)
  }

  async exercises() {
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

    return exercises.map((exercise) => new BaseExercise(exercise))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
