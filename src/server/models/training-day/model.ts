import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  MuscleGroup as PrismaMuscleGroup,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  WorkoutSessionEvent as PrismaWorkoutSessionEvent,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import { GQLTrainingDay, GQLWorkoutType } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import TrainingExercise from '../training-exercise/model'

export default class TrainingDay implements GQLTrainingDay {
  constructor(
    protected data: PrismaTrainingDay & {
      events?: PrismaWorkoutSessionEvent[]
      exercises?: (PrismaTrainingExercise & {
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
        base?: PrismaBaseExercise & {
          muscleGroups: PrismaMuscleGroup[]
        }
      })[]
    },
    protected context: GQLContext,
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
    const exercises = this.data.exercises

    if (exercises) {
      return exercises.map(
        (exercise) => new TrainingExercise(exercise, this.context),
      )
    } else {
      console.error(
        `[TrainingDay] No exercises found for day ${this.id}. Loading from database.`,
      )
      throw new GraphQLError('No exercises found for day')
    }
  }

  async duration() {
    const events = this.data.events
    if (events) {
      return events.find(
        (event) => event.type === 'PROGRESS' || event.type === 'COMPLETE',
      )?.totalDuration
    } else {
      console.error(
        `[TrainingDay] No workout session events found for day ${this.id}. Loading from database.`,
      )
      return 0
    }
  }

  get scheduledAt() {
    if (!this.data.scheduledAt) {
      return null
    }

    return this.data.scheduledAt.toISOString()
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
