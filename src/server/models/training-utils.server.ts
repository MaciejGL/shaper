import { prisma } from '@lib/db'
import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
} from '@prisma/client'

import { createId } from '@/lib/create-id'

type FullTrainingPlan = PrismaTrainingPlan & {
  weeks: (PrismaTrainingWeek & {
    days: (PrismaTrainingDay & {
      exercises: (PrismaTrainingExercise & {
        sets: PrismaExerciseSet[]
        base?: PrismaBaseExercise | null
      })[]
    })[]
  })[]
}

export async function getFullPlanById(id: string) {
  return prisma.trainingPlan.findUnique({
    where: { id },
    include: {
      weeks: {
        orderBy: {
          weekNumber: 'asc',
        },
        include: {
          days: {
            orderBy: {
              dayOfWeek: 'asc',
            },
            include: {
              exercises: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  base: true,
                  logs: true,
                  sets: {
                    include: {
                      log: true,
                    },
                    orderBy: {
                      order: 'asc',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function duplicatePlan({
  plan,
  asTemplate,
}: {
  plan: FullTrainingPlan
  asTemplate: boolean
}) {
  return prisma.$transaction(async (tx) => {
    const newPlanId = createId()

    await tx.trainingPlan.create({
      data: {
        id: newPlanId,
        title: asTemplate ? `${plan.title} (Copy)` : plan.title,
        description: plan.description,
        isPublic: false,
        isTemplate: asTemplate,
        isDraft: asTemplate ? false : plan.isDraft,
        createdById: plan.createdById,
        assignedToId: plan.assignedToId,
      },
    })

    const weeks = plan.weeks.map((week) => ({
      ...week,
      id: createId(),
      planId: newPlanId,
    }))

    const days = plan.weeks.flatMap((week, wIndex) =>
      week.days.map((day) => ({
        ...day,
        id: createId(),
        weekId: weeks[wIndex].id,
      })),
    )

    const exercises = plan.weeks.flatMap((week, wIndex) =>
      week.days.flatMap((day) =>
        day.exercises.map((ex) => ({
          ...ex,
          id: createId(),
          dayId: days.find(
            (d) =>
              d.dayOfWeek === day.dayOfWeek && d.weekId === weeks[wIndex].id,
          )!.id,
        })),
      ),
    )

    const sets = plan.weeks.flatMap((week, wIndex) =>
      week.days.flatMap((day) =>
        day.exercises.flatMap((exercise) =>
          exercise.sets.map((set) => ({
            ...set,
            id: createId(),
            exerciseId: exercises.find(
              (ex) =>
                ex.order === exercise.order &&
                ex.dayId ===
                  days.find(
                    (d) =>
                      d.dayOfWeek === day.dayOfWeek &&
                      d.weekId === weeks[wIndex].id,
                  )?.id,
            )!.id,
          })),
        ),
      ),
    )

    await tx.trainingWeek.createMany({
      data: weeks.map((w) => ({
        id: w.id,
        name: w.name,
        weekNumber: w.weekNumber,
        description: w.description,
        planId: w.planId,
      })),
    })

    await tx.trainingDay.createMany({
      data: days.map((d) => ({
        id: d.id,
        dayOfWeek: d.dayOfWeek,
        isRestDay: d.isRestDay,
        workoutType: d.workoutType,
        weekId: d.weekId,
      })),
    })

    await tx.trainingExercise.createMany({
      data: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        restSeconds: ex.restSeconds,
        tempo: ex.tempo,
        instructions: ex.instructions,
        order: ex.order,
        warmupSets: ex.warmupSets,
        dayId: ex.dayId,
        baseId: ex.baseId ?? null,
      })),
    })

    await tx.exerciseSet.createMany({
      data: sets.map((s) => ({
        id: s.id,
        order: s.order,
        reps: s.reps,
        minReps: s.minReps,
        maxReps: s.maxReps,
        weight: s.weight,
        rpe: s.rpe,
        exerciseId: s.exerciseId,
      })),
    })

    return await tx.trainingPlan.findUnique({
      where: { id: newPlanId },
    })
  })
}
