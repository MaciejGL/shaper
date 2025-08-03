import {
  BaseExercise as PrismaBaseExercise,
  FavouriteWorkout as PrismaFavouriteWorkout,
  FavouriteWorkoutExercise as PrismaFavouriteWorkoutExercise,
  FavouriteWorkoutSet as PrismaFavouriteWorkoutSet,
  Image as PrismaImage,
  MuscleGroup as PrismaMuscleGroup,
} from '@prisma/client'

import {
  GQLFavouriteWorkout,
  GQLFavouriteWorkoutExercise,
  GQLFavouriteWorkoutSet,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'

// Flexible type for constructor - accepts what Prisma actually returns
type FavouriteWorkoutWithRelations = PrismaFavouriteWorkout & {
  exercises?: (PrismaFavouriteWorkoutExercise & {
    base?:
      | (PrismaBaseExercise & {
          muscleGroups: PrismaMuscleGroup[]
          images: PrismaImage[]
        })
      | null
    sets?: PrismaFavouriteWorkoutSet[]
  })[]
}

type FavouriteWorkoutExerciseWithRelations = PrismaFavouriteWorkoutExercise & {
  base?:
    | (PrismaBaseExercise & {
        muscleGroups: PrismaMuscleGroup[]
        images: PrismaImage[]
      })
    | null
  sets?: PrismaFavouriteWorkoutSet[]
}

export default class FavouriteWorkout implements GQLFavouriteWorkout {
  constructor(
    protected data: FavouriteWorkoutWithRelations,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get description() {
    return this.data.description
  }

  get createdById() {
    return this.data.createdById
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  async exercises() {
    const exercises = this.data.exercises

    if (exercises) {
      return exercises
        .sort((a, b) => a.order - b.order)
        .map((exercise) => new FavouriteWorkoutExercise(exercise, this.context))
    }

    return []
  }
}

export class FavouriteWorkoutExercise implements GQLFavouriteWorkoutExercise {
  constructor(
    protected data: FavouriteWorkoutExerciseWithRelations,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get order() {
    return this.data.order
  }

  get baseId() {
    return this.data.baseId
  }

  get favouriteWorkoutId() {
    return this.data.favouriteWorkoutId
  }

  get restSeconds() {
    return this.data.restSeconds
  }

  get instructions() {
    return this.data.instructions
  }

  async base() {
    if (this.data.base) {
      // Create a structure compatible with BaseExercise expectations
      const baseExerciseData = {
        ...this.data.base,
        muscleGroups: this.data.base.muscleGroups.map((mg) => ({
          ...mg,
          category: {
            id: 'unknown',
            name: 'Unknown',
            createdAt: new Date(),
            slug: 'unknown',
          },
        })),
      }
      return new BaseExercise(baseExerciseData, this.context)
    }
    return null
  }

  async sets() {
    const sets = this.data.sets

    if (sets) {
      return sets
        .sort((a, b) => a.order - b.order)
        .map((set) => new FavouriteWorkoutSet(set, this.context))
    }

    return []
  }
}

export class FavouriteWorkoutSet implements GQLFavouriteWorkoutSet {
  constructor(
    protected data: PrismaFavouriteWorkoutSet,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get order() {
    return this.data.order
  }

  get reps() {
    return this.data.reps
  }

  get minReps() {
    return this.data.minReps
  }

  get maxReps() {
    return this.data.maxReps
  }

  get weight() {
    return this.data.weight
  }

  get rpe() {
    return this.data.rpe
  }

  get exerciseId() {
    return this.data.exerciseId
  }
}
