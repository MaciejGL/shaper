import {
  GQLEquipment,
  GQLExerciseType,
  GQLSubstitute,
  GQLTrainingExercise,
} from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  BaseExerciseSubstitute as PrismaBaseExerciseSubstitute,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  Image as PrismaImage,
  MuscleGroup as PrismaMuscleGroup,
  TrainingExercise as PrismaTrainingExercise,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import { BaseExerciseSubstitute } from '../base-exercise/model'
import ExerciseLog from '../exercise-log/model'
import ExerciseSet from '../exercise-set/model'
import Image from '../image/model'
import MuscleGroup from '../muscle-group/model'

export default class TrainingExercise implements GQLTrainingExercise {
  constructor(
    protected data: PrismaTrainingExercise & {
      substitutedBy?: PrismaTrainingExercise & {
        base?: PrismaBaseExercise & {
          muscleGroups: PrismaMuscleGroup[]
        }
        sets?: (PrismaExerciseSet & {
          log?: PrismaExerciseSetLog
        })[]
      }
      sets?: (PrismaExerciseSet & {
        log?: PrismaExerciseSetLog
      })[]
      base?:
        | (PrismaBaseExercise & {
            muscleGroups: PrismaMuscleGroup[]
            substitutes?: PrismaBaseExerciseSubstitute[]
            images: PrismaImage[]
          })
        | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get restSeconds() {
    return this.data.restSeconds
  }

  get tempo() {
    return this.data.tempo
  }

  get warmupSets() {
    return this.data.warmupSets
  }

  get description() {
    return this.data.base?.description
  }

  get instructions() {
    return this.data.base?.instructions
  }

  get tips() {
    return this.data.base?.tips
  }

  get difficulty() {
    return this.data.base?.difficulty
  }

  get additionalInstructions() {
    return this.data.additionalInstructions
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

  get order() {
    return this.data.order
  }

  get isExtra() {
    return this.data.isExtra
  }

  get dayId() {
    return this.data.dayId
  }

  get baseId() {
    return this.data.baseId
  }

  get images() {
    if (this.data.base?.images) {
      return this.data.base.images.map(
        (image) => new Image(image, this.context),
      )
    } else {
      // if (!isProd) {
      //   console.error(
      //     `[TrainingExercise] No images found for exercise ${this.id}. Skipping.`,
      //   )
      // }
      return []
    }
  }

  get equipment() {
    switch (this.data.base?.equipment) {
      case 'BAND':
        return GQLEquipment.Band
      case 'BARBELL':
        return GQLEquipment.Barbell
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
      case 'MEDICINE_BALL':
      case 'OTHER':
        return GQLEquipment.Other
      default:
        return GQLEquipment.Other
    }
  }

  get muscleGroups() {
    if (!this.data.base) {
      return []
    }

    return this.data.base.muscleGroups.map(
      (group) => new MuscleGroup(group, this.context),
    )
  }

  async videoUrl() {
    if (!this.data.base) {
      return null
    }

    return this.data.base.videoUrl
  }

  get completedAt() {
    return this.data.completedAt?.toISOString()
  }

  async sets() {
    const sets = this.data.sets

    if (sets) {
      return sets.map((set) => new ExerciseSet(set))
    } else {
      console.error(
        `[TrainingExercise] No sets found for exercise ${this.id}. Loading from database.`,
      )
      return []
    }
  }

  async logs() {
    console.error(
      `[TrainingExercise] Making database query for exercise logs in exercise ${this.id}. This could cause N+1 queries.`,
    )
    const logs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: this.id,
      },
    })

    return logs.map((log) => new ExerciseLog(log))
  }

  async substitutes() {
    return (
      this.data.base?.substitutes?.map((substitute) => {
        return new BaseExerciseSubstitute(substitute, this.context)
      }) ?? []
    )
  }

  get substitutedBy() {
    return this.data.substitutedBy
      ? new ExerciseSubstitute(this.data.substitutedBy, this.context)
      : null
  }

  get isPublic() {
    return this.data.base?.isPublic ?? false
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}

export class ExerciseSubstitute implements GQLSubstitute {
  constructor(
    protected data: PrismaTrainingExercise & {
      substitutedBy?: PrismaTrainingExercise
      base?:
        | (PrismaBaseExercise & {
            muscleGroups: PrismaMuscleGroup[]
            substitutes?: PrismaBaseExerciseSubstitute[]
          })
        | null
      sets?: (PrismaExerciseSet & {
        log?: PrismaExerciseSetLog
      })[]
    },
    protected context: GQLContext,
  ) {}

  get dayId() {
    return this.data.dayId
  }

  get baseId() {
    return this.data.baseId
  }

  get isPublic() {
    return this.data.base?.isPublic ?? false
  }

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description
  }

  get instructions() {
    return this.data.instructions
  }

  get tips() {
    return this.data.tips
  }

  get difficulty() {
    return this.data.difficulty
  }

  get additionalInstructions() {
    return this.data.additionalInstructions
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

  get completedAt() {
    return this.data.completedAt?.toISOString()
  }

  get muscleGroups() {
    if (!this.data.base) {
      return []
    }

    return this.data.base.muscleGroups.map(
      (group) => new MuscleGroup(group, this.context),
    )
  }

  get videoUrl() {
    if (!this.data.base) {
      return null
    }

    return this.data.base.videoUrl
  }

  async sets() {
    const sets = this.data.sets

    if (sets) {
      return sets.map((set) => new ExerciseSet(set))
    } else {
      console.error(
        `[TrainingExercise] No sets found for exercise ${this.id}. Loading from database.`,
      )
      return []
    }
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
