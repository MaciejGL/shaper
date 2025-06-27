import {
  BaseExercise as PrismaBaseExercise,
  MuscleGroup as PrismaMuscleGroup,
  MuscleGroupCategory as PrismaMuscleGroupCategory,
} from '@prisma/client'

import {
  GQLBaseExercise,
  GQLEquipment,
  GQLExerciseType,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import MuscleGroupCategory from '../muscle-group-category/model'
import MuscleGroup from '../muscle-group/model'
import UserPublic from '../user-public/model'

export default class BaseExercise implements GQLBaseExercise {
  constructor(
    protected data: PrismaBaseExercise & {
      muscleGroups: (PrismaMuscleGroup & {
        category: PrismaMuscleGroupCategory
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get additionalInstructions() {
    return this.data.additionalInstructions
  }

  get videoUrl() {
    return this.data.videoUrl
  }

  get equipment() {
    return this.data.equipment as GQLEquipment
  }

  get type() {
    switch (this.data.type) {
      case 'SUPERSET_1A':
        return GQLExerciseType.Superset_1A
      case 'SUPERSET_1B':
        return GQLExerciseType.Superset_1B
      case 'DROPSET':
        return GQLExerciseType.Dropset
      case 'CARDIO':
        return GQLExerciseType.Cardio
      default:
        return null
    }
  }

  async muscleGroups() {
    if (this.data.muscleGroups.length) {
      return this.data.muscleGroups.map((muscleGroup) => {
        return new MuscleGroup(muscleGroup, this.context)
      })
    }

    console.warn(
      `[BaseExercise] No muscle groups found for exercise ${this.id}. Loading from database.`,
    )

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        exercises: {
          some: {
            id: this.data.id,
          },
        },
      },
      include: {
        category: true,
      },
    })

    if (!muscleGroups.length) {
      return []
    }

    return muscleGroups.map(
      (muscleGroup) => new MuscleGroup(muscleGroup, this.context),
    )
  }

  async muscleGroupCategories() {
    if (this.data.muscleGroups.length) {
      return this.data.muscleGroups.map((muscleGroup) => {
        return new MuscleGroupCategory(muscleGroup.category, this.context)
      })
    }

    console.warn(
      `[BaseExercise] No muscle groups found for exercise ${this.id}. Loading from database.`,
    )

    const muscleGroups = await prisma.muscleGroup.findMany({
      where: {
        exercises: {
          some: {
            id: this.data.id,
          },
        },
      },
      include: {
        category: true,
      },
      distinct: ['categoryId'],
    })

    if (!muscleGroups.length) {
      return []
    }

    return muscleGroups.map(
      (muscleGroup) =>
        new MuscleGroupCategory(muscleGroup.category, this.context),
    )
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

    return new UserPublic(user, this.context)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
