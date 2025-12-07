import {
  endOfWeek,
  format,
  getDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns'

import { TRACKED_DISPLAY_GROUPS, getMuscleById } from '@/constants/muscles'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { invalidateUserBasicCache } from '@/lib/cache/user-cache'
import { prisma } from '@/lib/db'
import { invalidateUserCache } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import UserProfile from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  profile: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Use DataLoader to batch UserProfile queries and prevent N+1 queries
    let userProfile = await context.loaders.user.userProfileByUserId.load(
      userSession.user.id,
    )

    // If no profile exists, create one with defaults (handles legacy users)
    if (!userProfile) {
      // First verify the User record exists before creating a profile
      const userExists = await prisma.user.findUnique({
        where: { id: userSession.user.id },
      })

      if (!userExists) {
        console.error(
          `❌ [PROFILE-RESOLVER] User record not found for userId: ${userSession.user.id}`,
        )
        throw new Error('User not found')
      }

      console.info(
        `📝 [PROFILE-RESOLVER] Creating missing profile for user ${userSession.user.id}`,
      )

      userProfile = await prisma.userProfile.create({
        data: {
          userId: userSession.user.id,
          firstName: '',
          lastName: '',
        },
        include: {
          user: true,
          bodyMeasures: true,
        },
      })

      // Clear the loader cache so subsequent requests get the new profile
      context.loaders.user.userProfileByUserId.clear(userSession.user.id)
    }

    return new UserProfile(userProfile)
  },

  muscleGroupFrequency: async (_parent, { userId, days = 30 }) => {
    const startDate = subDays(new Date(), days)

    // Get completed exercises with muscle groups for the user in the time period
    const completedExercises = await prisma.trainingExercise.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
        day: {
          week: {
            plan: {
              assignedToId: userId,
            },
          },
        },
      },
      include: {
        base: {
          include: {
            muscleGroups: true,
          },
        },
        sets: {
          where: {
            completedAt: {
              not: null,
            },
          },
        },
      },
    })

    // Group by muscle groups and calculate stats
    const muscleGroupStats = new Map<
      string,
      {
        displayGroup: string
        groupName: string
        sessionsCount: number
        totalSets: number
        lastTrained: Date | null
      }
    >()

    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        const staticMuscle = getMuscleById(muscleGroup.id)
        const key =
          staticMuscle?.displayGroup || muscleGroup.displayGroup || 'Other'
        const existing = muscleGroupStats.get(key) || {
          displayGroup: key,
          groupName:
            staticMuscle?.displayGroup || muscleGroup.alias || muscleGroup.name,
          sessionsCount: 0,
          totalSets: 0,
          lastTrained: null,
        }

        existing.sessionsCount += 1
        existing.totalSets += exercise.sets.length

        if (
          !existing.lastTrained ||
          (exercise.completedAt && exercise.completedAt > existing.lastTrained)
        ) {
          existing.lastTrained = exercise.completedAt
        }

        muscleGroupStats.set(key, existing)
      })
    })

    return Array.from(muscleGroupStats.values()).map((stat) => ({
      ...stat,
      lastTrained: stat.lastTrained?.toISOString() || null,
    }))
  },

  muscleFrequency: async (_parent, { userId, days = 30 }) => {
    const startDate = subDays(new Date(), days)

    // Get completed exercises with muscle groups for the user in the time period
    const completedExercises = await prisma.trainingExercise.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
        day: {
          week: {
            plan: {
              assignedToId: userId,
            },
          },
        },
      },
      include: {
        base: {
          include: {
            muscleGroups: true,
          },
        },
        sets: {
          where: {
            completedAt: {
              not: null,
            },
          },
        },
      },
    })

    // Group by individual muscles and calculate stats
    const muscleStats = new Map<
      string,
      {
        muscleId: string
        muscleName: string
        muscleAlias: string
        displayGroup: string
        groupName: string
        sessionsCount: number
        totalSets: number
        lastTrained: Date | null
      }
    >()

    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        const key = muscleGroup.id // Use individual muscle ID as key
        const staticMuscle = getMuscleById(muscleGroup.id)
        const displayGroup =
          staticMuscle?.displayGroup || muscleGroup.displayGroup || 'Other'
        const existing = muscleStats.get(key) || {
          muscleId: muscleGroup.id,
          muscleName: muscleGroup.name,
          muscleAlias: muscleGroup.alias || muscleGroup.name,
          displayGroup,
          groupName: displayGroup,
          sessionsCount: 0,
          totalSets: 0,
          lastTrained: null,
        }

        existing.sessionsCount += 1
        existing.totalSets += exercise.sets.length

        if (
          !existing.lastTrained ||
          (exercise.completedAt && exercise.completedAt > existing.lastTrained)
        ) {
          existing.lastTrained = exercise.completedAt
        }

        muscleStats.set(key, existing)
      })
    })

    return Array.from(muscleStats.values()).map((stat) => ({
      ...stat,
      lastTrained: stat.lastTrained?.toISOString() || null,
    }))
  },

  muscleGroupDistribution: async (_parent, { userId, days = 30 }) => {
    const startDate = subDays(new Date(), days)

    // Get completed exercises with muscle groups for the user in the time period
    const completedExercises = await prisma.trainingExercise.findMany({
      where: {
        completedAt: {
          gte: startDate,
        },
        day: {
          week: {
            plan: {
              assignedToId: userId,
            },
          },
        },
      },
      include: {
        base: {
          include: {
            muscleGroups: true,
          },
        },
        sets: {
          where: {
            completedAt: {
              not: null,
            },
          },
        },
      },
    })

    // Initialize distribution with 0 values
    const distribution = {
      chest: 0,
      back: 0,
      shoulders: 0,
      arms: 0,
      legs: 0,
      core: 0,
      other: 0, // for neck, stabilizers
    }

    // Map display groups to main categories
    const displayGroupMapping: Record<string, keyof typeof distribution> = {
      Chest: 'chest',
      'Upper Back': 'back',
      'Lower Back': 'back',
      Lats: 'back',
      Traps: 'back',
      Shoulders: 'shoulders',
      Biceps: 'arms',
      Triceps: 'arms',
      Forearms: 'arms',
      Quads: 'legs',
      Hamstrings: 'legs',
      Glutes: 'legs',
      Calves: 'legs',
      'Inner Thighs': 'legs',
      Core: 'core',
    }

    // Count sets per muscle group category
    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        const staticMuscle = getMuscleById(muscleGroup.id)
        const displayGroup =
          staticMuscle?.displayGroup || muscleGroup.displayGroup || 'Other'
        const category = displayGroupMapping[displayGroup]
        if (category) {
          distribution[category] += exercise.sets.length
        }
      })
    })

    return distribution
  },

  weeklyMuscleProgress: async (
    _parent,
    { userId, weekOffset = 0, targetDate },
    context,
  ) => {
    const TARGET_SETS_PER_MUSCLE = 12

    // Get user's week start preference (0 = Sunday, 1 = Monday, etc.)
    const userProfile =
      await context.loaders.user.userProfileByUserId.load(userId)
    const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6

    // Calculate the target week's boundaries
    // If targetDate is provided, use that to determine the week
    // Otherwise fall back to weekOffset from current date
    const baseDate = targetDate
      ? new Date(targetDate)
      : subWeeks(new Date(), weekOffset)
    const targetWeekStart = startOfWeek(baseDate, { weekStartsOn })
    const targetWeekEnd = endOfWeek(baseDate, { weekStartsOn })

    // Get exercises where the day is SCHEDULED in the target week
    // This counts sets based on when the workout was planned, not when it was logged
    const exercisesWithCompletedSets = await prisma.trainingExercise.findMany({
      where: {
        day: {
          scheduledAt: {
            gte: targetWeekStart,
            lte: targetWeekEnd,
          },
          week: {
            plan: {
              assignedToId: userId,
            },
          },
        },
        // Only include exercises that have at least one completed set
        sets: {
          some: {
            completedAt: { not: null },
          },
        },
      },
      include: {
        day: {
          select: {
            scheduledAt: true,
          },
        },
        base: {
          include: {
            muscleGroups: true,
            secondaryMuscleGroups: true,
          },
        },
        // Only get the completed sets (not pending ones)
        sets: {
          where: {
            completedAt: { not: null },
          },
        },
      },
    })

    // Use tracked display groups from static muscles file
    const trackedMuscleGroups = [...TRACKED_DISPLAY_GROUPS]

    // Initialize progress for all muscle groups
    const muscleProgress: Record<
      string,
      { completedSets: number; lastTrained: Date | null }
    > = {}
    trackedMuscleGroups.forEach((group) => {
      muscleProgress[group] = { completedSets: 0, lastTrained: null }
    })

    // Track individual sub-muscle sets for breakdown
    const subMuscleProgress: Record<
      string,
      Record<string, { name: string; alias: string; completedSets: number }>
    > = {}
    trackedMuscleGroups.forEach((group) => {
      subMuscleProgress[group] = {}
    })

    // Aggregate sets by muscle group
    // Count sets ONCE per display group per exercise (not per sub-muscle)
    // Secondary muscles = 25% weight
    const SECONDARY_MUSCLE_WEIGHT = 0.25

    exercisesWithCompletedSets.forEach((exercise) => {
      if (!exercise.base) return
      const setCount = exercise.sets.length

      // Track which display groups we've already counted for THIS exercise
      // to avoid double-counting when exercise targets multiple muscles in same group
      const countedPrimaryGroups = new Set<string>()
      const countedSecondaryGroups = new Set<string>()

      // Primary muscle groups (100% weight) - count only ONCE per display group
      exercise.base.muscleGroups?.forEach((muscleGroup) => {
        const staticMuscle = getMuscleById(muscleGroup.id)
        const mappedGroup =
          staticMuscle?.displayGroup || muscleGroup.displayGroup

        if (mappedGroup && muscleProgress[mappedGroup]) {
          // Only add sets if we haven't counted this display group yet for this exercise
          if (!countedPrimaryGroups.has(mappedGroup)) {
            muscleProgress[mappedGroup].completedSets += setCount
            countedPrimaryGroups.add(mappedGroup)
          }

          // Track sub-muscle breakdown (still track each sub-muscle)
          const subMuscleKey = muscleGroup.name
          if (!subMuscleProgress[mappedGroup][subMuscleKey]) {
            subMuscleProgress[mappedGroup][subMuscleKey] = {
              name: muscleGroup.name,
              alias: muscleGroup.alias || muscleGroup.name,
              completedSets: 0,
            }
          }
          subMuscleProgress[mappedGroup][subMuscleKey].completedSets += setCount

          // Update lastTrained
          exercise.sets.forEach((set) => {
            if (
              set.completedAt &&
              (!muscleProgress[mappedGroup].lastTrained ||
                set.completedAt > muscleProgress[mappedGroup].lastTrained!)
            ) {
              muscleProgress[mappedGroup].lastTrained = set.completedAt
            }
          })
        }
      })

      // Secondary muscle groups (25% weight) - count only ONCE per display group
      exercise.base.secondaryMuscleGroups?.forEach((muscleGroup) => {
        const staticMuscle = getMuscleById(muscleGroup.id)
        const mappedGroup =
          staticMuscle?.displayGroup || muscleGroup.displayGroup

        if (mappedGroup && muscleProgress[mappedGroup]) {
          // Only add sets if we haven't counted this display group yet
          // (check both primary and secondary to avoid double-counting)
          if (
            !countedPrimaryGroups.has(mappedGroup) &&
            !countedSecondaryGroups.has(mappedGroup)
          ) {
            muscleProgress[mappedGroup].completedSets +=
              setCount * SECONDARY_MUSCLE_WEIGHT
            countedSecondaryGroups.add(mappedGroup)
          }

          // Track sub-muscle breakdown (with weight)
          const subMuscleKey = muscleGroup.name
          if (!subMuscleProgress[mappedGroup][subMuscleKey]) {
            subMuscleProgress[mappedGroup][subMuscleKey] = {
              name: muscleGroup.name,
              alias: muscleGroup.alias || muscleGroup.name,
              completedSets: 0,
            }
          }
          subMuscleProgress[mappedGroup][subMuscleKey].completedSets +=
            setCount * SECONDARY_MUSCLE_WEIGHT

          // Update lastTrained
          exercise.sets.forEach((set) => {
            if (
              set.completedAt &&
              (!muscleProgress[mappedGroup].lastTrained ||
                set.completedAt > muscleProgress[mappedGroup].lastTrained!)
            ) {
              muscleProgress[mappedGroup].lastTrained = set.completedAt
            }
          })
        }
      })
    })

    // Calculate weekly progress array with raw totals
    const weeklyMuscleProgress = trackedMuscleGroups.map((group) => {
      const progress = muscleProgress[group]
      const percentage = Math.min(
        100,
        (progress.completedSets / TARGET_SETS_PER_MUSCLE) * 100,
      )

      // Get sub-muscle breakdown
      const subMuscles = Object.values(subMuscleProgress[group]).map((sub) => ({
        name: sub.name,
        alias: sub.alias,
        completedSets: Math.floor(sub.completedSets),
      }))

      return {
        muscleGroup: group,
        completedSets: Math.floor(progress.completedSets),
        targetSets: TARGET_SETS_PER_MUSCLE,
        percentage: Math.round(percentage * 10) / 10,
        lastTrained: progress.lastTrained?.toISOString() || null,
        subMuscles,
      }
    })

    // Calculate overall percentage (average of all muscle groups)
    const totalPercentage = weeklyMuscleProgress.reduce(
      (sum, m) => sum + m.percentage,
      0,
    )
    const overallPercentage =
      Math.round((totalPercentage / trackedMuscleGroups.length) * 10) / 10

    // Calculate streak (consecutive weeks with >= 80% overall completion)
    let streakWeeks = 0
    const STREAK_THRESHOLD = 80

    // Only calculate streak if looking at current week (no targetDate and weekOffset = 0)
    const now = new Date()
    const isCurrentWeek = !targetDate && weekOffset === 0
    if (isCurrentWeek) {
      // Check previous weeks for streak (based on scheduled dates, not completion dates)
      for (let i = 1; i <= 12; i++) {
        const prevWeekStart = startOfWeek(subWeeks(now, i), { weekStartsOn })
        const prevWeekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn })

        const prevWeekExercises = await prisma.trainingExercise.findMany({
          where: {
            day: {
              scheduledAt: {
                gte: prevWeekStart,
                lte: prevWeekEnd,
              },
              week: {
                plan: {
                  assignedToId: userId,
                },
              },
            },
            sets: {
              some: {
                completedAt: { not: null },
              },
            },
          },
          include: {
            base: {
              include: {
                muscleGroups: true,
              },
            },
            sets: {
              where: {
                completedAt: { not: null },
              },
            },
          },
        })

        // Calculate that week's overall percentage
        const prevMuscleProgress: Record<string, number> = {}
        trackedMuscleGroups.forEach((group) => {
          prevMuscleProgress[group] = 0
        })

        prevWeekExercises.forEach((exercise) => {
          if (!exercise.base?.muscleGroups) return
          exercise.base.muscleGroups.forEach((muscleGroup) => {
            const staticMuscle = getMuscleById(muscleGroup.id)
            const mappedGroup =
              staticMuscle?.displayGroup || muscleGroup.displayGroup
            if (mappedGroup && prevMuscleProgress[mappedGroup] !== undefined) {
              prevMuscleProgress[mappedGroup] += exercise.sets.length
            }
          })
        })

        const prevTotalPercentage = trackedMuscleGroups.reduce((sum, group) => {
          const pct = Math.min(
            100,
            (prevMuscleProgress[group] / TARGET_SETS_PER_MUSCLE) * 100,
          )
          return sum + pct
        }, 0)
        const prevOverallPct = prevTotalPercentage / trackedMuscleGroups.length

        if (prevOverallPct >= STREAK_THRESHOLD) {
          streakWeeks++
        } else {
          break
        }
      }
    }

    return {
      weekStartDate: targetWeekStart.toISOString(),
      weekEndDate: targetWeekEnd.toISOString(),
      overallPercentage,
      muscleProgress: weeklyMuscleProgress,
      streakWeeks,
    }
  },

  activityHeatmap: async (_parent, { userId, weekCount = 8 }, context) => {
    const userProfile =
      await context.loaders.user.userProfileByUserId.load(userId)
    const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6

    const now = new Date()
    const startDate = startOfWeek(subWeeks(now, weekCount - 1), {
      weekStartsOn,
    })
    const endDate = endOfWeek(now, { weekStartsOn })

    // Query sets with their day's scheduledAt date
    const completedSets = await prisma.exerciseSet.findMany({
      where: {
        completedAt: { not: null }, // Only completed sets
        exercise: {
          day: {
            scheduledAt: {
              gte: startDate,
              lte: endDate,
            },
            week: {
              plan: {
                assignedToId: userId,
              },
            },
          },
        },
      },
      select: {
        exercise: {
          select: {
            day: {
              select: {
                scheduledAt: true,
              },
            },
          },
        },
      },
    })

    const dailyTotals = new Map<string, number>()

    // Group by day.scheduledAt instead of set.completedAt
    completedSets.forEach((set) => {
      const scheduledAt = set.exercise?.day?.scheduledAt
      if (scheduledAt) {
        const dateKey = format(scheduledAt, 'yyyy-MM-dd')
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + 1)
      }
    })

    const activities = Array.from(dailyTotals.entries()).map(
      ([date, totalSets]) => ({
        date,
        totalSets,
        dayOfWeek: getDay(new Date(date)),
      }),
    )

    return {
      activities,
      weekCount,
    }
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  updateProfile: async (_parent, { input }, context) => {
    const user = context.user?.user
    if (!user) {
      throw new Error('User not found')
    }

    const { email, ...rest } = input

    // Build data object with only provided fields
    const updateData: Prisma.UserProfileUpdateInput = {}

    // Only update fields that are explicitly provided
    if (rest.firstName !== undefined)
      updateData.firstName = rest.firstName || null
    if (rest.lastName !== undefined) updateData.lastName = rest.lastName || null
    if (rest.phone !== undefined) updateData.phone = rest.phone || null
    if (rest.birthday !== undefined) updateData.birthday = rest.birthday || null
    if (rest.sex !== undefined) updateData.sex = rest.sex || null
    if (rest.avatarUrl !== undefined)
      updateData.avatarUrl = rest.avatarUrl || null
    if (rest.height !== undefined) updateData.height = rest.height || null
    if (rest.weight !== undefined) updateData.weight = rest.weight || null
    if (rest.fitnessLevel !== undefined)
      updateData.fitnessLevel = rest.fitnessLevel || null
    if (rest.activityLevel !== undefined)
      updateData.activityLevel = rest.activityLevel || null
    if (rest.goals !== undefined) updateData.goals = rest.goals || []
    if (rest.allergies !== undefined)
      updateData.allergies = rest.allergies || null
    if (rest.bio !== undefined) updateData.bio = rest.bio || null

    // Trainer-specific fields
    if (rest.specialization !== undefined)
      updateData.specialization = rest.specialization || []
    if (rest.credentials !== undefined)
      updateData.credentials = rest.credentials || []
    if (rest.successStories !== undefined)
      updateData.successStories = rest.successStories || []
    if (rest.trainerSince !== undefined)
      updateData.trainerSince = rest.trainerSince
        ? new Date(rest.trainerSince)
        : null

    // Preference fields
    if (rest.weekStartsOn !== undefined)
      updateData.weekStartsOn = rest.weekStartsOn
    if (rest.weightUnit !== undefined) updateData.weightUnit = rest.weightUnit
    if (rest.heightUnit !== undefined) updateData.heightUnit = rest.heightUnit
    if (rest.theme !== undefined) updateData.theme = rest.theme
    if (rest.timeFormat !== undefined) updateData.timeFormat = rest.timeFormat
    if (rest.trainingView !== undefined)
      updateData.trainingView = rest.trainingView
    if (rest.hasCompletedOnboarding !== undefined)
      updateData.hasCompletedOnboarding = rest.hasCompletedOnboarding

    // Notification preferences
    if (rest.notificationPreferences?.workoutReminders !== undefined) {
      updateData.workoutReminders =
        rest.notificationPreferences.workoutReminders
    }
    if (rest.notificationPreferences?.progressUpdates !== undefined) {
      updateData.progressUpdates = rest.notificationPreferences.progressUpdates
    }
    if (rest.notificationPreferences?.systemNotifications !== undefined) {
      updateData.systemNotifications =
        rest.notificationPreferences.systemNotifications
    }
    if (rest.notificationPreferences?.emailNotifications !== undefined) {
      updateData.emailNotifications =
        rest.notificationPreferences.emailNotifications
    }
    if (rest.notificationPreferences?.pushNotifications !== undefined) {
      updateData.pushNotifications =
        rest.notificationPreferences.pushNotifications
    }
    if (rest.notificationPreferences?.checkinReminders !== undefined) {
      updateData.checkinReminders =
        rest.notificationPreferences.checkinReminders
    }

    // Check-in preferences
    if (rest.timezone !== undefined) updateData.timezone = rest.timezone
    if (rest.checkinReminders !== undefined)
      updateData.checkinReminders = rest.checkinReminders
    if (rest.blurProgressSnapshots !== undefined)
      updateData.blurProgressSnapshots = rest.blurProgressSnapshots

    // If email update was requested and User exists, update it separately
    if (user && email) {
      const emailToUpdate = email.trim()
      if (emailToUpdate && emailToUpdate !== user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { email: emailToUpdate },
        })
      }
    }

    // Use upsert to create profile if it doesn't exist (handles legacy users)
    const userProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        firstName: rest.firstName || '',
        lastName: rest.lastName || '',
      },
      update: updateData,
      include: {
        user: true,
      },
    })

    // Invalidate caches so navbar/UI gets fresh data immediately
    if (user?.email) {
      invalidateUserCache(user.email)
    }
    // Invalidate Redis cache for userBasic GraphQL query
    await invalidateUserBasicCache(user.id)

    return new UserProfile(userProfile)
  },
}
