import { BaseExercise as PrismaBaseExercise } from '@prisma/client'

import { GQLBaseExercise } from '@/generated/graphql-server'
import MuscleGroup from '../muscle-group/model'
import { prisma } from '@/lib/db'
import UserPublic from '../user-public/model'


export default class BaseExercise implements GQLBaseExercise {
  constructor(protected data: PrismaBaseExercise) {}

  get id() {
    return this.data.id
  }

  
  get name() {
    return this.data.name
  }
  
  get description() {
    return this.data.description
  }

  get videoUrl() {
    return this.data.videoUrl
  }

  get equipment() {
    return this.data.equipment
  }

  async muscleGroups() {
    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        exercises: {
          some: {
            id: this.data.id,
          },
        },
      },
    })

    return muscleGroups.map((muscleGroup) => new MuscleGroup(muscleGroup))
  }

  get isPublic() {
    return this.data.isPublic
  }

  async createdBy() {
    if (!this.data.createdById) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        id: this.data.createdById,
      },
    })

    if (!user) {
      return null
    }

    return new UserPublic(user)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
