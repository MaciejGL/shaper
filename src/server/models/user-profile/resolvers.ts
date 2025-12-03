import {
  endOfWeek,
  format,
  getDay,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns'

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
        groupSlug: string
        groupName: string
        sessionsCount: number
        totalSets: number
        lastTrained: Date | null
      }
    >()

    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        const key = muscleGroup.groupSlug
        const existing = muscleGroupStats.get(key) || {
          groupSlug: muscleGroup.groupSlug,
          groupName: muscleGroup.alias || muscleGroup.name,
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
        groupSlug: string
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
        const existing = muscleStats.get(key) || {
          muscleId: muscleGroup.id,
          muscleName: muscleGroup.name,
          muscleAlias: muscleGroup.alias || muscleGroup.name,
          groupSlug: muscleGroup.groupSlug,
          groupName: muscleGroup.alias || muscleGroup.name, // This will be the group name
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

    // Map muscle group slugs to main categories
    const muscleGroupMapping: Record<string, keyof typeof distribution> = {
      chest: 'chest',
      'upper-back': 'back',
      'lower-back': 'back',
      neck: 'back',
      shoulders: 'shoulders',
      biceps: 'arms',
      triceps: 'arms',
      forearms: 'arms',
      quads: 'legs',
      hamstrings: 'legs',
      glutes: 'legs',
      calves: 'legs',
      'hip-adductors': 'legs',
      'hip-abductors': 'legs',
      core: 'core',
      stabilizers: 'core',
    }

    // Enhanced debugging disabled - use admin panel to fix broken exercise relationships
    // console.info('🔍 Enhanced debugging muscle group mapping...')

    // Debugging code commented out - use admin panel instead
    /* 
    const allGroupSlugs = new Set<string>()
    const exercisesWithIssues: string[] = []

    completedExercises.forEach((exercise) => {
      // Check for exercises without base
      if (!exercise.base) {
        console.info(
          `❌ Exercise "${exercise.name}" has NO BASE EXERCISE (baseId: ${exercise.baseId})`,
        )
        exercisesWithIssues.push(`${exercise.name} - NO BASE`)
        return
      }

      // Check for exercises without muscle groups
      if (
        !exercise.base.muscleGroups ||
        exercise.base.muscleGroups.length === 0
      ) {
        console.info(`⚠️ Exercise "${exercise.name}" has NO MUSCLE GROUPS`)
        exercisesWithIssues.push(`${exercise.name} - NO MUSCLE GROUPS`)
        return
      }

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        if (muscleGroup.groupSlug) {
          allGroupSlugs.add(muscleGroup.groupSlug)
        } else {
          console.info(
            `⚠️ Exercise "${exercise.name}" has muscle group "${muscleGroup.name}" with NULL/UNDEFINED groupSlug:`,
            muscleGroup,
          )
          exercisesWithIssues.push(`${exercise.name} - NULL groupSlug`)
        }
      })
    })

    if (exercisesWithIssues.length > 0) {
      console.info('🚨 Exercises with issues:', exercisesWithIssues)
    }

    // ALSO check ALL training exercises (not just completed) for muscle group issues
    console.info(
      '🔍 Checking ALL training exercises for muscle group issues...',
    )
    const allTrainingExercises = await prisma.trainingExercise.findMany({
      where: {
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
      },
      take: 50, // Limit to recent exercises
      orderBy: {
        createdAt: 'desc',
      },
    })

    const allExerciseIssues: string[] = []
    allTrainingExercises.forEach((exercise) => {
      if (!exercise.base) {
        allExerciseIssues.push(`${exercise.name} - NO BASE`)
      } else if (
        !exercise.base.muscleGroups ||
        exercise.base.muscleGroups.length === 0
      ) {
        allExerciseIssues.push(`${exercise.name} - NO MUSCLE GROUPS`)
      } else {
        const nullGroupSlugs = exercise.base.muscleGroups.filter(
          (mg) => !mg.groupSlug,
        )
        if (nullGroupSlugs.length > 0) {
          allExerciseIssues.push(
            `${exercise.name} - ${nullGroupSlugs.length} NULL groupSlugs`,
          )
        }
      }
    })

    if (allExerciseIssues.length > 0) {
      console.info(
        '🚨 ALL training exercises with muscle group issues:',
        allExerciseIssues,
      )
    } else {
      console.info('✅ All training exercises have proper muscle group data')
    }

    console.info(
      '📊 All groupSlug values found in data:',
      Array.from(allGroupSlugs),
    )
    console.info('🗺️ Available in mapping:', Object.keys(muscleGroupMapping))

    // Find missing mappings
    const missingMappings = Array.from(allGroupSlugs).filter(
      (slug) => !muscleGroupMapping[slug],
    )
    if (missingMappings.length > 0) {
      console.info('❌ Missing mappings for:', missingMappings)
    }

    // Log detailed issues per exercise
    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      const problematicGroups = exercise.base.muscleGroups.filter(
        (mg) => !mg.groupSlug || !muscleGroupMapping[mg.groupSlug],
      )

      if (problematicGroups.length > 0) {
        console.info(
          `🚨 "${exercise.name}" has problematic muscle groups:`,
          problematicGroups.map((mg) => ({
            id: mg.id,
            name: mg.name,
            groupSlug: mg.groupSlug,
            isMapped: !!muscleGroupMapping[mg.groupSlug],
          })),
        )
      }
    })
    */

    // Count sets per muscle group category
    completedExercises.forEach((exercise) => {
      if (!exercise.base?.muscleGroups) return

      exercise.base.muscleGroups.forEach((muscleGroup) => {
        const category = muscleGroupMapping[muscleGroup.groupSlug]
        if (category) {
          distribution[category] += exercise.sets.length
        }
      })
    })

    // console.info(distribution) // Debug output disabled

    return distribution
  },

  weeklyMuscleProgress: async (
    _parent,
    { userId, weekOffset = 0 },
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
    const now = new Date()
    const targetWeekStart = startOfWeek(subWeeks(now, weekOffset), {
      weekStartsOn,
    })
    const targetWeekEnd = endOfWeek(subWeeks(now, weekOffset), {
      weekStartsOn,
    })

    // Get exercises that have sets completed in the target week
    // (counts individual sets, not just fully completed exercises)
    const exercisesWithCompletedSets = await prisma.trainingExercise.findMany({
      where: {
        day: {
          week: {
            plan: {
              assignedToId: userId,
            },
          },
        },
        sets: {
          some: {
            completedAt: {
              gte: targetWeekStart,
              lte: targetWeekEnd,
            },
          },
        },
      },
      include: {
        base: {
          include: {
            muscleGroups: true,
            secondaryMuscleGroups: true,
          },
        },
        sets: {
          where: {
            completedAt: {
              gte: targetWeekStart,
              lte: targetWeekEnd,
            },
          },
        },
      },
    })

    // Define muscle groups ordered by popularity (most trained first)
    const trackedMuscleGroups = [
      'Chest',
      'Upper Back',
      'Lower Back',
      'Lats',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Quads',
      'Hamstrings',
      'Glutes',
      'Calves',
      'Core', // Combined Abs + Obliques
      'Forearms',
      'Traps',
      'Inner Thighs',
    ]

    // Map groupSlug to our muscle group names
    const slugToMuscleGroup: Record<string, string> = {
      chest: 'Chest',
      'upper-back': 'Upper Back',
      shoulders: 'Shoulders',
      biceps: 'Biceps',
      triceps: 'Triceps',
      quads: 'Quads',
      hamstrings: 'Hamstrings',
      glutes: 'Glutes',
      calves: 'Calves',
      core: 'Core',
      forearms: 'Forearms',
      'hip-adductors': 'Inner Thighs',
      'lower-back': 'Lower Back',
      lats: 'Lats',
      traps: 'Traps',
    }

    // Initialize progress for all muscle groups
    const muscleProgress: Record<
      string,
      { completedSets: number; lastTrained: Date | null }
    > = {}
    trackedMuscleGroups.forEach((group) => {
      muscleProgress[group] = { completedSets: 0, lastTrained: null }
    })

    // Aggregate sets by muscle group
    // Primary muscles = 100%, Secondary muscles = 25%
    const SECONDARY_MUSCLE_WEIGHT = 0.25

    exercisesWithCompletedSets.forEach((exercise) => {
      if (!exercise.base) return
      const setCount = exercise.sets.length

      // Primary muscle groups (100% weight)
      exercise.base.muscleGroups?.forEach((muscleGroup) => {
        const mappedGroup = slugToMuscleGroup[muscleGroup.groupSlug]
        if (mappedGroup && muscleProgress[mappedGroup]) {
          muscleProgress[mappedGroup].completedSets += setCount

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

      // Secondary muscle groups (25% weight)
      exercise.base.secondaryMuscleGroups?.forEach((muscleGroup) => {
        const mappedGroup = slugToMuscleGroup[muscleGroup.groupSlug]
        if (mappedGroup && muscleProgress[mappedGroup]) {
          muscleProgress[mappedGroup].completedSets +=
            setCount * SECONDARY_MUSCLE_WEIGHT

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

    // Calculate weekly progress array
    const weeklyMuscleProgress = trackedMuscleGroups.map((group) => {
      const progress = muscleProgress[group]
      const percentage = Math.min(
        100,
        (progress.completedSets / TARGET_SETS_PER_MUSCLE) * 100,
      )
      return {
        muscleGroup: group,
        completedSets: Math.round(progress.completedSets),
        targetSets: TARGET_SETS_PER_MUSCLE,
        percentage: Math.round(percentage * 10) / 10,
        lastTrained: progress.lastTrained?.toISOString() || null,
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

    // Only calculate streak if looking at current week
    if (weekOffset === 0) {
      // Check previous weeks for streak
      for (let i = 1; i <= 12; i++) {
        const prevWeekStart = startOfWeek(subWeeks(now, i), { weekStartsOn })
        const prevWeekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn })

        const prevWeekExercises = await prisma.trainingExercise.findMany({
          where: {
            completedAt: {
              gte: prevWeekStart,
              lte: prevWeekEnd,
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

        // Calculate that week's overall percentage
        const prevMuscleProgress: Record<string, number> = {}
        trackedMuscleGroups.forEach((group) => {
          prevMuscleProgress[group] = 0
        })

        prevWeekExercises.forEach((exercise) => {
          if (!exercise.base?.muscleGroups) return
          exercise.base.muscleGroups.forEach((muscleGroup) => {
            const mappedGroup = slugToMuscleGroup[muscleGroup.groupSlug]
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

    const completedSets = await prisma.exerciseSet.findMany({
      where: {
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
        exercise: {
          day: {
            week: {
              plan: {
                assignedToId: userId,
              },
            },
          },
        },
      },
      select: {
        completedAt: true,
      },
    })

    const dailyTotals = new Map<string, number>()

    completedSets.forEach((set) => {
      if (set.completedAt) {
        const dateKey = format(set.completedAt, 'yyyy-MM-dd')
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
