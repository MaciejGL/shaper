import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  WorkoutSessionEvent as PrismaWorkoutSessionEvent,
} from '@prisma/client'

import { GQLTrainingDay, GQLWorkoutType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import TrainingExercise from '../training-exercise/model'

export default class TrainingDay implements GQLTrainingDay {
  constructor(
    protected data: PrismaTrainingDay & {
      events?: PrismaWorkoutSessionEvent[]
      exercises?: (PrismaTrainingExercise & {
        sets?: (PrismaExerciseSet & {
          log?: PrismaExerciseSetLog
        })[]
        base?: PrismaBaseExercise
      })[]
    },
  ) {}

  get id() {
    return this.data.id
  }

  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get isRestDay() {
    return this.data.isRestDay
  }

  get workoutType() {
    return this.data.workoutType as GQLWorkoutType
  }

  get trainingWeekId() {
    return this.data.weekId
  }

  get completedAt() {
    if (!this.data.completedAt) {
      return null
    }

    return this.data.completedAt.toISOString()
  }

  get startedAt() {
    const firstCompletedSet = this.data.exercises
      ?.at(0)
      ?.sets?.at(0)?.completedAt
    if (!firstCompletedSet) {
      return null
    }

    return firstCompletedSet.toISOString()
  }

  async exercises() {
    let exercises = this.data.exercises

    if (!exercises) {
      console.warn(
        `[TrainingDay] No exercises found for day ${this.id}. Loading from database.`,
      )
      exercises = await prisma.trainingExercise.findMany({
        where: {
          dayId: this.id,
        },
      })
    }
    return exercises.map((exercise) => new TrainingExercise(exercise))
  }

  async duration() {
    let events = this.data.events

    if (!events) {
      console.warn(
        `[TrainingDay] No workout session events found for day ${this.id}. Loading from database.`,
      )
      events = await prisma.workoutSessionEvent.findMany({
        where: { dayId: this.id },
        orderBy: { timestamp: 'asc' },
      })
    }

    const event = events.find(
      (event) => event.type === 'PROGRESS' || event.type === 'COMPLETE',
    )

    if (!event) {
      return 0
    }

    return event.totalDuration
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
