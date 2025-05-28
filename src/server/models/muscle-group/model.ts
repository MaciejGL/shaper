import { MuscleGroup as PrismaMuscleGroup } from '@prisma/client'

import { GQLMuscleGroup } from '@/generated/graphql-server'
import MuscleGroupCategory from '../muscle-group-category/model'
import { prisma } from '@/lib/db'
import BaseExercise from '../base-exercise/model'


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
    })

    return exercises.map((exercise) => new BaseExercise(exercise))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
