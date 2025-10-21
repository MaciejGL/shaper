import {
  Prisma,
  Ingredient as PrismaIngredient,
  Meal as PrismaMeal,
  MealIngredient as PrismaMealIngredient,
  Team as PrismaTeam,
  User as PrismaUser,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

/**
 * Service for managing team-scoped meal library access and operations
 */
export class TeamMealLibraryService {
  /**
   * Get the team ID for a trainer
   */
  static async getTrainerTeam(trainerId: string): Promise<PrismaTeam | null> {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
      },
      include: {
        team: true,
      },
    })

    return teamMember?.team || null
  }

  /**
   * Get all meals for a team with optional search and sorting
   */
  static async getTeamMeals(
    teamId: string,
    searchQuery?: string,
    sortBy?: 'NAME' | 'USAGE_COUNT' | 'CREATED_AT',
    includeArchived?: boolean,
  ): Promise<
    (PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
      _count: {
        planMeals: number
      }
    })[]
  > {
    const whereClause: Prisma.MealWhereInput = {
      teamId,
      // By default, exclude archived meals unless explicitly requested
      archived: includeArchived ? undefined : false,
    }

    // Add search functionality if query provided
    if (searchQuery && searchQuery.trim()) {
      whereClause.OR = [
        {
          name: {
            contains: searchQuery.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchQuery.trim(),
            mode: 'insensitive',
          },
        },
      ]
    }

    // Determine sort order
    let orderBy: Prisma.MealOrderByWithRelationInput[] = []

    switch (sortBy) {
      case 'NAME':
        orderBy = [{ name: 'asc' }]
        break
      case 'USAGE_COUNT':
        orderBy = [{ planMeals: { _count: 'desc' } }, { name: 'asc' }]
        break
      case 'CREATED_AT':
        orderBy = [{ createdAt: 'desc' }, { name: 'asc' }]
        break
      default:
        // Default sort by name
        orderBy = [{ name: 'asc' }]
    }

    return await prisma.meal.findMany({
      where: whereClause,
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        team: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                createdBy: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            planMeals: true,
          },
        },
      },
      orderBy,
    })
  }

  /**
   * Check if a trainer can access a specific meal
   */
  static async canAccessMeal(
    mealId: string,
    trainerId: string,
  ): Promise<boolean> {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      select: {
        teamId: true,
      },
    })

    if (!meal || !meal.teamId) {
      return false
    }

    // Check if trainer is in the same team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        teamId: meal.teamId,
      },
    })

    return !!teamMember
  }

  /**
   * Check if a trainer can modify a specific meal
   */
  static async canModifyMeal(
    mealId: string,
    trainerId: string,
  ): Promise<boolean> {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      select: {
        createdById: true,
        teamId: true,
      },
    })

    if (!meal) {
      return false
    }

    // Creator can always modify
    if (meal.createdById === trainerId) {
      return true
    }

    // Team admin can modify any meal in their team
    if (meal.teamId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          userId: trainerId,
          teamId: meal.teamId,
          role: 'ADMIN',
        },
      })
      return !!teamMember
    }

    return false
  }

  /**
   * Get meal statistics for a team
   */
  static async getTeamMealStats(teamId: string): Promise<{
    totalMeals: number
    mealsThisWeek: number
    topCreators: {
      userId: string
      userName: string
      mealCount: number
    }[]
  }> {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Get total meals count
    const totalMeals = await prisma.meal.count({
      where: { teamId },
    })

    // Get meals created this week
    const mealsThisWeek = await prisma.meal.count({
      where: {
        teamId,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    // Get top creators (limit to top 5)
    const topCreators = await prisma.meal.groupBy({
      by: ['createdById'],
      where: { teamId },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    // Fetch user names for top creators
    const creatorIds = topCreators.map((creator) => creator.createdById)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: creatorIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    const topCreatorsWithNames = topCreators.map((creator) => {
      const user = users.find((u) => u.id === creator.createdById)
      return {
        userId: creator.createdById,
        userName: user?.name || 'Unknown User',
        mealCount: creator._count.id,
      }
    })

    return {
      totalMeals,
      mealsThisWeek,
      topCreators: topCreatorsWithNames,
    }
  }

  /**
   * Get recently created meals for a team
   */
  static async getRecentTeamMeals(
    teamId: string,
    limit: number = 10,
  ): Promise<
    (PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
    })[]
  > {
    return await prisma.meal.findMany({
      where: { teamId },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        team: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                createdBy: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  /**
   * Get popular meals for a team (most used in nutrition plans)
   */
  static async getPopularTeamMeals(
    teamId: string,
    limit: number = 10,
  ): Promise<
    (PrismaMeal & {
      createdBy: PrismaUser
      team: PrismaTeam | null
      ingredients: (PrismaMealIngredient & {
        ingredient: PrismaIngredient & {
          createdBy: PrismaUser
        }
      })[]
      _count: {
        planMeals: number
      }
    })[]
  > {
    return await prisma.meal.findMany({
      where: { teamId },
      include: {
        createdBy: {
          include: {
            profile: true,
          },
        },
        team: true,
        ingredients: {
          include: {
            ingredient: {
              include: {
                createdBy: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            planMeals: true,
          },
        },
      },
      orderBy: {
        planMeals: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }

  /**
   * Validate team access for meal operations
   */
  static async validateTeamAccess(
    trainerId: string,
    requiredTeamId?: string,
  ): Promise<string> {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        ...(requiredTeamId && { teamId: requiredTeamId }),
      },
    })

    if (!teamMember) {
      if (requiredTeamId) {
        throw new Error(
          'Access denied: You must be part of this team to perform this action',
        )
      } else {
        throw new Error('You must be part of a team to access team meals')
      }
    }

    return teamMember.teamId
  }

  /**
   * Check if trainer is team admin
   */
  static async isTeamAdmin(
    trainerId: string,
    teamId: string,
  ): Promise<boolean> {
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        teamId,
        role: 'ADMIN',
      },
    })

    return !!teamMember
  }
}
