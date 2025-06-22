import { GQLAddAiExerciseToWorkoutInput } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'
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

export const addAiExerciseToWorkout = async (
  input: GQLAddAiExerciseToWorkoutInput,
  context: GQLContext,
) => {
  const { dayId, exerciseId, sets } = input

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
      id: dayId,
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
        createMany: {
          data: sets.map((set, index) => ({
            reps: set?.reps,
            weight: set?.weight,
            rpe: set?.rpe,
            order: index + 1,
            isExtra: true,
            minReps: set?.reps,
          })),
        },
      },
    },
  })

  return new TrainingExercise(trainingExercise, context)
}

export const removeExerciseFromWorkout = async (exerciseId: string) => {
  const workout = await prisma.trainingDay.findFirst({
    where: {
      exercises: {
        some: {
          id: exerciseId,
        },
      },
    },
    include: {
      exercises: true,
    },
  })

  if (!workout) {
    throw new Error('Workout not found')
  }

  const removedExercise = workout.exercises.find(
    (exercise) => exercise.id === exerciseId,
  )
  if (!removedExercise) {
    throw new Error('Exercise not found in workout')
  }

  await prisma.trainingExercise.delete({
    where: {
      id: exerciseId,
      isExtra: true,
    },
  })

  await prisma.trainingExercise.updateMany({
    where: {
      dayId: workout.id,
      isExtra: true,
      order: { gt: removedExercise.order },
    },
    data: {
      order: { decrement: 1 },
    },
  })

  const day = await prisma.trainingDay.findUnique({
    where: {
      id: workout.id,
    },
    include: {
      exercises: true,
    },
  })

  const allExercisesCompleted = day?.exercises.every(
    (exercise) => exercise.completedAt,
  )

  if (allExercisesCompleted) {
    await prisma.trainingDay.update({
      where: { id: workout.id },
      data: { completedAt: new Date() },
    })
  }

  if (!day) {
    throw new Error('Day not found')
  }

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

/* ------------------------------------------------------------------ */
/*  ENV SETUP                                                          */

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!

/* ------------------------------------------------------------------ */
/*  main factory                                                       */
export const getAiExerciseSuggestions = async (
  dayId: string,
  context: GQLContext,
) => {
  /* 1.  Fetch workout day + logs */
  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    include: {
      week: { select: { plan: { select: { createdById: true } } } },
      exercises: {
        include: {
          sets: { include: { log: { select: { weight: true, reps: true } } } },
          base: { include: { muscleGroups: { select: { name: true } } } },
        },
      },
    },
  })
  const userTrainerId = context.user?.user.trainerId
  if (!day || day.exercises.length === 0) {
    throw new Error('No exercises found for this day')
  }

  //* ------------------------------------------------------------------ */
  /* 2.  Build a compact summary of the workout the athlete just logged */
  const workoutSummary = day.exercises
    .map((ex, idx) => {
      const setsText = ex.sets
        .map((s) => {
          const w = s.log?.weight ?? 0
          const r = s.log?.reps ?? 0
          return `${w} kg x ${r}`
        })
        .join(', ')
      const muscles = ex.base?.muscleGroups.map((m) => m.name).join(', ')
      return `${idx + 1}. ${ex.name} [${muscles}]: ${setsText}`
    })
    .join('\n')

  /* ------------------------------------------------------------------ */
  /* 3.  Ask the Assistant for three accessory-exercise suggestions     */

  const thread = await openai.beta.threads.create()

  await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: ASSISTANT_ID,
    additional_messages: [
      {
        role: 'user',
        content: `The athlete just completed:
      ${workoutSummary}

      - trainerId: ${userTrainerId}
      - Prioritize exercises from file that were created by trainerId: ${userTrainerId}
      - Return *exactly* 3 additional exercise suggestions 
      - RPE should be highest possible and reasonable for the athlete based on the workout summary
      - Weight should be highest possible and reasonable(can be calculated based on the workout summary from similar exercises and logged weights per set)
  `,
      },
    ],
  })

  /* ------------------------------------------------------------------ */
  /* 5.  Pull the Assistant's last message and parse the JSON           */
  const { data: threadMessages } = await openai.beta.threads.messages.list(
    thread.id,
    { limit: 1 },
  )
  const assistantReply =
    threadMessages[0]?.content?.[0]?.type === 'text'
      ? threadMessages[0].content[0].text.value.trim()
      : ''

  // In case the Assistant wrapped the JSON in back-ticks, strip them:
  const jsonStart = assistantReply.indexOf('[')
  const jsonEnd = assistantReply.lastIndexOf(']')
  const rawJson =
    jsonStart !== -1 && jsonEnd !== -1
      ? assistantReply.slice(jsonStart, jsonEnd + 1)
      : assistantReply

  type Suggestion = {
    id: string
    sets: number
    reps: number
    weight: number
    rpe: number
    explanation: string
  }

  let suggestions: Suggestion[]
  try {
    suggestions = JSON.parse(rawJson)
  } catch (err) {
    throw new Error('Assistant response was not valid JSON')
  }

  /* 5.  Hydrate BaseExercise entities */
  const baseExercises = await prisma.baseExercise.findMany({
    where: { id: { in: suggestions.map((s) => s.id) } },
    include: { muscleGroups: { include: { category: true } } },
  })

  const results = baseExercises.map((exercise) => {
    const s = suggestions.find((x) => x.id === exercise.id)!
    return {
      exercise: new BaseExercise(exercise, context),
      sets: Array.from({ length: s.sets }).map(() => ({
        reps: s.reps,
        weight: s.weight,
        rpe: s.rpe,
      })),
      aiMeta: { explanation: s.explanation },
    }
  })

  return results
}
