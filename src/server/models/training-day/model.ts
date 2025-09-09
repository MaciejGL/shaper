import { GraphQLError } from 'graphql'

import { GQLTrainingDay, GQLWorkoutType } from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  Image as PrismaImage,
  MuscleGroup as PrismaMuscleGroup,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  WorkoutSessionEvent as PrismaWorkoutSessionEvent,
} from '@/generated/prisma/client'
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
          images: PrismaImage[]
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
    // First try new smart duration calculation based on actual activity
    const smartDuration = this.calculateSmartDuration()
    if (smartDuration > 0) {
      return smartDuration
    }

    // Fallback to event-based tracking for backwards compatibility
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

  private calculateSmartDuration(): number {
    if (!this.data.exercises || this.data.exercises.length === 0) {
      return 0
    }

    // Get all completed set timestamps
    const completedTimestamps = this.data.exercises
      .flatMap((ex) => ex.sets || [])
      .filter((set) => set.completedAt)
      .map((set) => new Date(set.completedAt!).getTime())
      .sort((a, b) => a - b) // Sort chronologically

    if (completedTimestamps.length === 0) {
      return 0
    }

    // Calculate duration filtering out long gaps (>15 minutes)
    const GAP_THRESHOLD = 15 * 60 * 1000 // 15 minutes in milliseconds
    let totalDuration = 0
    let lastTimestamp = completedTimestamps[0]

    for (let i = 1; i < completedTimestamps.length; i++) {
      const currentTimestamp = completedTimestamps[i]
      const gap = currentTimestamp - lastTimestamp

      if (gap <= GAP_THRESHOLD) {
        // Normal activity - add the gap
        totalDuration += gap
      }
      // If gap > 15 minutes, don't add it (filter out break/pause time)

      lastTimestamp = currentTimestamp
    }

    // Convert to seconds
    return Math.round(totalDuration / 1000)
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
