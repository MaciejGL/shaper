import {
  GQLFavouriteWorkout,
  GQLFavouriteWorkoutExercise,
  GQLFavouriteWorkoutFolder,
  GQLFavouriteWorkoutSet,
} from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  FavouriteWorkout as PrismaFavouriteWorkout,
  FavouriteWorkoutExercise as PrismaFavouriteWorkoutExercise,
  FavouriteWorkoutFolder as PrismaFavouriteWorkoutFolder,
  FavouriteWorkoutSet as PrismaFavouriteWorkoutSet,
  Image as PrismaImage,
  MuscleGroup as PrismaMuscleGroup,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'

type FavouriteWorkoutFolderWithRelations = PrismaFavouriteWorkoutFolder & {
  favouriteWorkouts?: PrismaFavouriteWorkout[]
}

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
  folder?: PrismaFavouriteWorkoutFolder | null
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

  get folderId() {
    return this.data.folderId
  }

  async folder() {
    if (this.data.folder) {
      return new FavouriteWorkoutFolder(this.data.folder, this.context)
    }
    return null
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

  get description() {
    return this.data.description
  }

  get additionalInstructions() {
    return this.data.additionalInstructions
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

export class FavouriteWorkoutFolder implements GQLFavouriteWorkoutFolder {
  constructor(
    protected data: FavouriteWorkoutFolderWithRelations,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
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

  async favouriteWorkouts() {
    const workouts = this.data.favouriteWorkouts

    if (workouts) {
      return workouts.map(
        (workout) => new FavouriteWorkout(workout, this.context),
      )
    }

    return []
  }
}
