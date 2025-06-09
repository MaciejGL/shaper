import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  TrainingExercise as PrismaTrainingExercise,
} from '@prisma/client'

import { GQLTrainingExercise } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import ExerciseLog from '../exercise-log/model'
import ExerciseSet from '../exercise-set/model'

export default class TrainingExercise implements GQLTrainingExercise {
  constructor(
    protected data: PrismaTrainingExercise & {
      sets?: (PrismaExerciseSet & {
        log?: PrismaExerciseSetLog
      })[]
      base?: Pick<PrismaBaseExercise, 'videoUrl'>
    },
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

  get order() {
    return this.data.order
  }

  get dayId() {
    return this.data.dayId
  }

  get baseId() {
    return this.data.baseId
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
