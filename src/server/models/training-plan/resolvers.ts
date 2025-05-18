import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { getCurrentUserOrThrow } from '@/lib/getUser'

import TrainingPlan from './model'

export const Query: GQLQueryResolvers = {
  getTrainingPlanById: async (_, { id }) => {
    const user = await getCurrentUserOrThrow()
    const trainingPlan = await prisma.trainingPlan.findUnique({
      where: {
        id,
        OR: [{ createdById: user.user.id }, { assignedToId: user.user.id }],
      },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    sets: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!trainingPlan) {
      throw new Error('Training plan not found')
    }
    return new TrainingPlan(trainingPlan)
  },
  getTemplates: async () => {
    const user = await getCurrentUserOrThrow()
    const templates = await prisma.trainingPlan.findMany({
      where: { isTemplate: true, createdById: user.user.id },
    })
    return templates.map((template) => new TrainingPlan(template))
  },
}

export const Mutation: GQLMutationResolvers = {
  createTrainingPlan: async (_, { input }) => {
    const user = await getCurrentUserOrThrow()
    const { title, isPublic, isTemplate, description, weeks } = input
    await prisma.trainingPlan.create({
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

    return true
  },

  updateTrainingPlan: async (_, { input }) => {
    const user = await getCurrentUserOrThrow()
    await prisma.$transaction(async (tx) => {
      await tx.trainingWeek.deleteMany({
        where: { planId: input.id },
      })

      await tx.trainingPlan.update({
        where: { id: input.id, createdById: user.user.id },
        data: {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          isPublic: input.isPublic ?? false,
          isTemplate: input.isTemplate ?? false,
          weeks: {
            create: input.weeks?.map((week) => ({
              weekNumber: week.weekNumber,
              name: week.name ?? '', // fallback if needed
              description: week.description ?? undefined,
              days: {
                create: week.days?.map((day) => ({
                  dayOfWeek: day.dayOfWeek,
                  isRestDay: day.isRestDay ?? false,
                  workoutType: day.workoutType ?? undefined,
                  exercises: {
                    create: day.exercises?.map((exercise) => ({
                      name: exercise.name ?? '',
                      restSeconds: exercise.restSeconds ?? undefined,
                      tempo: exercise.tempo ?? undefined,
                      instructions: exercise.instructions ?? undefined,
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
    })

    return true
  },
  duplicateTrainingPlan: async (_, { id }) => {
    const user = await getCurrentUserOrThrow()

    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    sets: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!plan || plan.createdById !== user.user.id) {
      throw new Error('Training plan not found or unauthorized')
    }

    const duplicated = await prisma.trainingPlan.create({
      data: {
        title: `${plan.title} (Copy)`,
        description: plan.description,
        isPublic: false,
        isTemplate: true,
        createdById: user.user.id,
        weeks: {
          create: plan.weeks.map((week) => ({
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            days: {
              create: week.days.map((day) => ({
                dayOfWeek: day.dayOfWeek,
                isRestDay: day.isRestDay,
                workoutType: day.workoutType,
                exercises: {
                  create: day.exercises.map((exercise) => ({
                    name: exercise.name,
                    restSeconds: exercise.restSeconds,
                    tempo: exercise.tempo,
                    instructions: exercise.instructions,
                    order: exercise.order,
                    sets: {
                      create: exercise.sets.map((set) => ({
                        order: set.order,
                        reps: set.reps,
                        weight: set.weight,
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

    return duplicated.id
  },
  deleteTrainingPlan: async (_, { id }) => {
    const user = await getCurrentUserOrThrow()

    // First check if the training plan exists and user has permission
    const trainingPlan = await prisma.trainingPlan.findUnique({
      where: { id, createdById: user.user.id },
    })

    if (!trainingPlan) {
      throw new Error('Training plan not found')
    }

    // If we get here, we know the plan exists and user has permission
    await prisma.trainingPlan.delete({
      where: { id },
    })

    return true
  },
}
