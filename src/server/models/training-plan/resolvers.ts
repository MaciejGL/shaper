import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { getCurrentUserOrThrow } from '@/lib/getUser'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  createTrainingPlan: async (_, { input }) => {
    const user = await getCurrentUserOrThrow()
    const { title, isPublic, isTemplate, description, weeks } = input
    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        title,
        description,
        isPublic: isPublic ?? false,
        isTemplate: isTemplate ?? false,
        createdById: user.user.id,
        weeks: {
          create: weeks?.map((week) => ({
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            days: {
              create: week.days?.map((day) => ({
                dayOfWeek: day.dayOfWeek,
                isRestDay: day.isRestDay,
                workoutType: day.workoutType,
                exercises: {
                  create: day.exercises?.map((exercise) => ({
                    name: exercise.name,
                    restSeconds: exercise.restSeconds,
                    tempo: exercise.tempo,
                    instructions: exercise.instructions,
                    order: exercise.order,
                    sets: {
                      create: exercise.sets?.map((set) => ({
                        order: set.order,
                        reps: set.reps,
                        weight: set.weight ?? null,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    })

    console.log('trainingPlan', trainingPlan)

    return true
  },
  deleteTrainingPlan: async (_, { id }) => {
    const user = await getCurrentUserOrThrow()
    await prisma.trainingPlan.delete({
      where: { id, createdById: user.user.id },
    })
    return true
  },
}
