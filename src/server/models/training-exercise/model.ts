import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  MuscleGroup as PrismaMuscleGroup,
  TrainingExercise as PrismaTrainingExercise,
} from '@prisma/client'

import {
  GQLExerciseType,
  GQLTrainingExercise,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import ExerciseLog from '../exercise-log/model'
import ExerciseSet from '../exercise-set/model'
import MuscleGroup from '../muscle-group/model'

export default class TrainingExercise implements GQLTrainingExercise {
  constructor(
    protected data: PrismaTrainingExercise & {
      sets?: (PrismaExerciseSet & {
        log?: PrismaExerciseSetLog
      })[]
      base?: PrismaBaseExercise & {
        muscleGroups: PrismaMuscleGroup[]
      }
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

  get instructions() {
    return this.data.instructions
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
    let sets = this.data.sets

    if (!sets) {
      console.warn(
        `[TrainingExercise] No sets found for exercise ${this.id}. Loading from database.`,
      )
      sets = await prisma.exerciseSet.findMany({
        where: {
          exerciseId: this.id,
        },
      })
    }

    return sets.map((set) => new ExerciseSet(set))
  }

  async logs() {
    const logs = await prisma.exerciseLog.findMany({
      where: {
        exerciseId: this.id,
      },
    })

    return logs.map((log) => new ExerciseLog(log))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
