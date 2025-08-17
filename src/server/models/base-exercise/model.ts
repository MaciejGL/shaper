import {
  BaseExercise as PrismaBaseExercise,
  BaseExerciseSubstitute as PrismaBaseExerciseSubstitute,
  Image as PrismaImage,
  MuscleGroup as PrismaMuscleGroup,
  MuscleGroupCategory as PrismaMuscleGroupCategory,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  GQLBaseExercise,
  GQLBaseExerciseSubstitute,
  GQLEquipment,
  GQLExerciseType,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Image from '../image/model'
import MuscleGroupCategory from '../muscle-group-category/model'
import MuscleGroup from '../muscle-group/model'
import UserPublic from '../user-public/model'

export class BaseExerciseSubstitute implements GQLBaseExerciseSubstitute {
  constructor(
    protected data: PrismaBaseExerciseSubstitute & {
      original?: PrismaBaseExercise & {
        muscleGroups: (PrismaMuscleGroup & {
          category: PrismaMuscleGroupCategory
        })[]
      }
      substitute?: PrismaBaseExercise & {
        muscleGroups: (PrismaMuscleGroup & {
          category: PrismaMuscleGroupCategory
        })[]
      }
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get originalId() {
    return this.data.originalId
  }

  get substituteId() {
    return this.data.substituteId
  }

  get reason() {
    return this.data.reason
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  async original() {
    if (this.data.original) {
      return new BaseExercise(this.data.original, this.context)
    }

    console.error(
      `[BaseExerciseSubstitute] No original exercise found for substitute ${this.id}. Loading from database.`,
    )

    throw new GraphQLError('Original exercise not found')
  }

  async substitute() {
    if (this.data.substitute) {
      return new BaseExercise(this.data.substitute, this.context)
    }

    console.error(
      `[BaseExerciseSubstitute] No substitute exercise found for substitute ${this.id}. Loading from database.`,
    )

    throw new GraphQLError('Substitute exercise not found')
  }
}

export default class BaseExercise implements GQLBaseExercise {
  constructor(
    protected data: PrismaBaseExercise & {
      muscleGroups: (PrismaMuscleGroup & {
        category: PrismaMuscleGroupCategory
      })[]
      secondaryMuscleGroups?: (PrismaMuscleGroup & {
        category: PrismaMuscleGroupCategory
      })[]
      images?: PrismaImage[]
      substitutes?: (PrismaBaseExerciseSubstitute & {
        substitute: PrismaBaseExercise & {
          muscleGroups: (PrismaMuscleGroup & {
            category: PrismaMuscleGroupCategory
          })[]
        }
      })[]
      substitutedBy?: (PrismaBaseExerciseSubstitute & {
        original: PrismaBaseExercise & {
          muscleGroups: (PrismaMuscleGroup & {
            category: PrismaMuscleGroupCategory
          })[]
        }
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
    switch (this.data.equipment) {
      case 'BAND':
        return GQLEquipment.Band
      case 'BARBELL':
        return GQLEquipment.Barbell
      case 'EZ_BAR':
        return GQLEquipment.EzBar
      case 'BODYWEIGHT':
        return GQLEquipment.Bodyweight
      case 'CABLE':
        return GQLEquipment.Cable
      case 'DUMBBELL':
        return GQLEquipment.Dumbbell
      case 'KETTLEBELL':
        return GQLEquipment.Kettlebell
      case 'MACHINE':
        return GQLEquipment.Machine
      case 'SMITH_MACHINE':
        return GQLEquipment.SmithMachine
      case 'BENCH':
        return GQLEquipment.Bench
      case 'TRAP_BAR':
        return GQLEquipment.TrapBar
      case 'OTHER':
        return GQLEquipment.Other
      default:
        return GQLEquipment.Other
    }
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
    } else {
      console.error(
        `[BaseExercise] No muscle groups found for exercise ${this.id}. Loading from database.`,
      )
      throw new GraphQLError('No muscle groups found for exercise')
    }
  }

  async secondaryMuscleGroups() {
    if (this.data.secondaryMuscleGroups?.length) {
      return this.data.secondaryMuscleGroups.map((muscleGroup) => {
        return new MuscleGroup(muscleGroup, this.context)
      })
    }
    return []
  }

  async muscleGroupCategories() {
    if (this.data.muscleGroups.length) {
      return this.data.muscleGroups.map((muscleGroup) => {
        return new MuscleGroupCategory(muscleGroup.category, this.context)
      })
    } else {
      console.error(
        `[BaseExercise] No muscle groups found for exercise ${this.id}. Loading from database.`,
      )
      throw new GraphQLError('No muscle groups found for exercise')
    }
  }

  get isPublic() {
    return this.data.isPublic
  }

  async createdBy() {
    if (!this.data.createdById) {
      return null
    }

    console.error(
      `[BaseExercise] Making database query for createdBy user in exercise ${this.id}. This could cause N+1 queries.`,
    )
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

  async substitutes() {
    if (this.data.substitutes) {
      return this.data.substitutes.map(
        (substitute) => new BaseExerciseSubstitute(substitute, this.context),
      )
    }

    const substitutes = await prisma.baseExerciseSubstitute.findMany({
      where: { originalId: this.data.id },
      include: {
        substitute: {
          include: {
            muscleGroups: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    return substitutes.map(
      (substitute) => new BaseExerciseSubstitute(substitute, this.context),
    )
  }

  async canBeSubstitutedBy() {
    if (this.data.substitutedBy) {
      return this.data.substitutedBy.map(
        (substitute) => new BaseExerciseSubstitute(substitute, this.context),
      )
    }

    const substitutedBy = await prisma.baseExerciseSubstitute.findMany({
      where: { substituteId: this.data.id },
      include: {
        original: {
          include: {
            muscleGroups: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    return substitutedBy.map(
      (substitute) => new BaseExerciseSubstitute(substitute, this.context),
    )
  }

  async images() {
    if (this.data.images) {
      return this.data.images.map((image) => new Image(image, this.context))
    } else {
      // if (!isProd) {
      //   console.error(
      //     `[BaseExercise] No images found for exercise ${this.id}. Skipping.`,
      //   )
      // }
      return []
    }
  }

  // V2 Exercise Integration Field Getters
  get version() {
    return this.data.version
  }

  get difficulty() {
    return this.data.difficulty
  }

  get instructions() {
    return this.data.instructions
  }

  get tips() {
    return this.data.tips
  }

  get isPremium() {
    return this.data.isPremium
  }
}
