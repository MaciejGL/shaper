import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import ExerciseSet from '../exercise-set/model'

import TrainingExercise from './model'

export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  context: GQLContext,
) => {
  const baseExericse = await prisma.baseExercise.findUnique({
    where: {
      id: exerciseId,
    },
  })
  if (!baseExericse) {
    throw new Error('Exercise not found')
  }
  const trainingDay = await prisma.trainingDay.findUnique({
    where: {
      id: workoutId,
    },
    include: {
      exercises: true,
    },
  })

  if (!trainingDay) {
    throw new Error('Training day not found')
  }

  const trainingExercise = await prisma.trainingExercise.create({
    data: {
      baseId: baseExericse.id,
      dayId: trainingDay.id,
      name: baseExericse.name,
      order: trainingDay.exercises.length + 1,
      instructions: baseExericse.description,
      additionalInstructions: baseExericse.additionalInstructions,
      isExtra: true,
      sets: {
        create: {
          order: 1,
          isExtra: true,
        },
      },
    },
  })

  return new TrainingExercise(trainingExercise, context)
}

export const removeExerciseFromWorkout = async (exerciseId: string) => {
  await prisma.trainingExercise.delete({
    where: {
      id: exerciseId,
      isExtra: true,
    },
  })

  return true
}

export const addSet = async (exerciseId: string) => {
  const trainingExercise = await prisma.trainingExercise.findUnique({
    where: {
      id: exerciseId,
    },
    include: {
      sets: {
        select: {
          id: true,
          isExtra: true,
        },
      },
    },
  })

  if (!trainingExercise) {
    throw new Error('Training exercise not found')
  }

  const set = await prisma.exerciseSet.create({
    data: {
      exerciseId: trainingExercise.id,
      order: trainingExercise.sets.length + 1,
      isExtra: true,
    },
  })

  return new ExerciseSet(set)
}

export const removeSet = async (setId: string) => {
  const exercise = await prisma.trainingExercise.findFirst({
    where: {
      sets: {
        some: { id: setId },
      },
    },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!exercise) {
    throw new Error('Training exercise not found')
  }

  const removedSet = exercise.sets.find((set) => set.id === setId)
  if (!removedSet) {
    throw new Error('Set not found in exercise')
  }

  // Delete the set
  await prisma.exerciseSet.delete({
    where: { id: setId },
  })

  // Update order for remaining sets
  await prisma.exerciseSet.updateMany({
    where: {
      exerciseId: exercise.id,
      isExtra: true,
      order: { gt: removedSet.order }, // only sets after the deleted one
    },
    data: {
      order: { decrement: 1 },
    },
  })

  return true
}
