import { NextResponse } from 'next/server'

import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

export async function GET() {
  try {
    const session = await getCurrentUser()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const userId = session.user.id

    // Fetch all user data in parallel
    const [
      user,
      userProfile,
      bodyMeasures,
      bodyProgressLogs,
      trainingPlans,
      nutritionPlans,
      favouriteWorkouts,
      completedSets,
    ] = await Promise.all([
      // Basic user info
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),

      // User profile
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          birthday: true,
          sex: true,
          avatarUrl: true,
          height: true,
          weight: true,
          fitnessLevel: true,
          activityLevel: true,
          goals: true,
          allergies: true,
          bio: true,
          weightUnit: true,
          heightUnit: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Body measurements
      prisma.userBodyMeasure.findMany({
        where: {
          userProfile: { userId },
        },
        select: {
          measuredAt: true,
          weight: true,
          chest: true,
          waist: true,
          hips: true,
          neck: true,
          bicepsLeft: true,
          bicepsRight: true,
          thighLeft: true,
          thighRight: true,
          calfLeft: true,
          calfRight: true,
          bodyFat: true,
          notes: true,
        },
        orderBy: { measuredAt: 'desc' },
      }),

      // Body progress logs (photos)
      prisma.bodyProgressLog.findMany({
        where: {
          userProfile: { userId },
        },
        select: {
          loggedAt: true,
          image1Url: true,
          image2Url: true,
          image3Url: true,
          notes: true,
        },
        orderBy: { loggedAt: 'desc' },
      }),

      // Training plans (owned or assigned)
      prisma.trainingPlan.findMany({
        where: {
          OR: [{ createdById: userId }, { assignedToId: userId }],
        },
        select: {
          title: true,
          description: true,
          active: true,
          createdAt: true,
          weeks: {
            select: {
              weekNumber: true,
              days: {
                select: {
                  dayOfWeek: true,
                  isRestDay: true,
                  workoutType: true,
                  completedAt: true,
                  exercises: {
                    select: {
                      order: true,
                      name: true,
                      additionalInstructions: true,
                      base: {
                        select: {
                          name: true,
                        },
                      },
                      sets: {
                        select: {
                          order: true,
                          reps: true,
                          weight: true,
                          rpe: true,
                          completedAt: true,
                          log: {
                            select: {
                              reps: true,
                              weight: true,
                              rpe: true,
                            },
                          },
                        },
                        orderBy: { order: 'asc' },
                      },
                    },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { dayOfWeek: 'asc' },
              },
            },
            orderBy: { weekNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Nutrition plans
      prisma.nutritionPlan.findMany({
        where: {
          OR: [{ trainerId: userId }, { clientId: userId }],
        },
        select: {
          name: true,
          description: true,
          isSharedWithClient: true,
          createdAt: true,
          days: {
            select: {
              dayNumber: true,
              name: true,
              meals: {
                select: {
                  orderIndex: true,
                  meal: {
                    select: {
                      name: true,
                      ingredients: {
                        select: {
                          grams: true,
                          ingredient: {
                            select: {
                              name: true,
                              caloriesPer100g: true,
                              proteinPer100g: true,
                              carbsPer100g: true,
                              fatPer100g: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { dayNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Favourite workouts
      prisma.favouriteWorkout.findMany({
        where: { createdById: userId },
        select: {
          title: true,
          description: true,
          createdAt: true,
          exercises: {
            select: {
              name: true,
              order: true,
              sets: {
                select: {
                  order: true,
                  reps: true,
                  weight: true,
                  rpe: true,
                },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Completed exercise sets (workout history)
      prisma.exerciseSet.findMany({
        where: {
          completedAt: { not: null },
          exercise: {
            day: {
              week: {
                plan: {
                  OR: [{ assignedToId: userId }, { createdById: userId }],
                },
              },
            },
          },
        },
        include: {
          log: {
            select: {
              reps: true,
              weight: true,
              rpe: true,
            },
          },
          exercise: {
            select: {
              base: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 1000, // Limit to last 1000 completed sets
      }),
    ])

    // Format workout history for easier reading
    const workoutHistory = completedSets.map((set) => ({
      completedAt: set.completedAt?.toISOString(),
      exercise: set.exercise?.base?.name,
      targetReps: set.reps,
      targetWeight: set.weight,
      targetRpe: set.rpe,
      actualReps: set.log?.reps,
      actualWeight: set.log?.weight,
      actualRpe: set.log?.rpe,
    }))

    // Build export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        ...user,
        createdAt: user?.createdAt?.toISOString(),
      },
      profile: userProfile
        ? {
            ...userProfile,
            createdAt: userProfile.createdAt?.toISOString(),
            updatedAt: userProfile.updatedAt?.toISOString(),
          }
        : null,
      bodyMeasurements: bodyMeasures.map((m) => ({
        ...m,
        measuredAt: m.measuredAt?.toISOString(),
      })),
      progressPhotos: bodyProgressLogs.map((p) => ({
        ...p,
        loggedAt: p.loggedAt?.toISOString(),
      })),
      trainingPlans: trainingPlans.map((plan) => ({
        ...plan,
        createdAt: plan.createdAt?.toISOString(),
      })),
      nutritionPlans: nutritionPlans.map((plan) => ({
        ...plan,
        createdAt: plan.createdAt?.toISOString(),
      })),
      favouriteWorkouts: favouriteWorkouts.map((fw) => ({
        ...fw,
        createdAt: fw.createdAt?.toISOString(),
      })),
      workoutHistory,
    }

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2)

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="hypro-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 },
    )
  }
}
