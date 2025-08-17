import type { USDAFood } from '@prisma/client'

import { prisma } from '@/lib/db'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * USDA search result interface for external consumption
 */
export interface USDASearchResult {
  id: string
  fdcId: number
  name: string
  source: 'usda'
  // Food classification
  dataType: string
  foodCategory?: string
  // Brand information
  brandOwner?: string
  brandName?: string
  // Nutrition data (per 100g)
  caloriesPer100g?: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  fiberPer100g?: number
  sugarPer100g?: number
  sodiumPer100g?: number
  calciumPer100g?: number
  ironPer100g?: number
}

/**
 * Database statistics for USDA food data
 */
export interface USDAStats {
  total: number
  srLegacy: number
  foundation: number
  withCalories: number
  completionRate: number
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform a Prisma USDAFood record to USDASearchResult
 * Centralizes the data transformation logic to avoid repetition
 */
function transformUSDAFoodToResult(food: USDAFood): USDASearchResult {
  return {
    id: food.id,
    fdcId: food.fdcId,
    // Use friendly displayName if available, otherwise fall back to technical description
    name: food.displayName || food.description,
    source: 'usda',
    dataType: food.dataType,
    foodCategory: food.foodCategory || undefined,
    brandOwner: food.brandOwner || undefined,
    brandName: food.brandName || undefined,
    caloriesPer100g: food.caloriesPer100g || undefined,
    proteinPer100g: food.proteinPer100g || undefined,
    carbsPer100g: food.carbsPer100g || undefined,
    fatPer100g: food.fatPer100g || undefined,
    fiberPer100g: food.fiberPer100g || undefined,
    sugarPer100g: food.sugarPer100g || undefined,
    sodiumPer100g: food.sodiumPer100g || undefined,
    calciumPer100g: food.calciumPer100g || undefined,
    ironPer100g: food.ironPer100g || undefined,
  }
}

// ============================================================================
// SEARCH SERVICE CLASS
// ============================================================================

export class USDASearchService {
  /**
   * Search USDA foods in local database with intelligent filtering and ordering
   * Searches both friendly displayName and technical description for best user experience
   * @param query - Search term (minimum 2 characters)
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise<USDASearchResult[]> - Array of matching foods
   */
  async searchFoods(query: string, limit = 10): Promise<USDASearchResult[]> {
    if (query.length < 2) return []

    try {
      // Enhanced search: Look in both displayName (user-friendly) AND description (technical)
      const foods = await prisma.uSDAFood.findMany({
        where: {
          AND: [
            {
              // Search in both displayName and description for maximum coverage
              OR: [
                {
                  displayName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              ],
              dataType: {
                in: ['foundation_food'],
              },
            },
            // Leverage the nutrition filter index for faster queries
            {
              OR: [
                { caloriesPer100g: { not: null } },
                { proteinPer100g: { not: null } },
                { carbsPer100g: { not: null } },
                { fatPer100g: { not: null } },
              ],
            },
          ],
        },
        take: limit * 2, // Fetch more to allow for smart ranking
        // Smart ordering: prioritize foods with displayName, then by quality
        orderBy: [
          { displayName: { sort: 'asc', nulls: 'last' } }, // Foods with friendly names first
          { dataType: 'desc' }, // sr_legacy_food comes first (better data quality)
          { description: 'asc' }, // Then alphabetical for consistency
        ],
      })

      // Smart ranking: prioritize displayName matches over description matches
      const rankedFoods = this.rankSearchResults(foods, query).slice(0, limit)

      return rankedFoods.map(transformUSDAFoodToResult)
    } catch (error) {
      console.error('USDA search error:', error)
      // Return empty results instead of throwing to allow graceful fallback
      return []
    }
  }

  /**
   * Rank search results to prioritize user-friendly displayName matches
   * @param foods - Array of foods from database
   * @param query - Original search query
   * @returns Ranked array of foods
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rankSearchResults(foods: any[], query: string): any[] {
    const lowerQuery = query.toLowerCase()

    return foods.sort((a, b) => {
      // Score calculation (higher = better)
      const scoreA = this.calculateRelevanceScore(a, lowerQuery)
      const scoreB = this.calculateRelevanceScore(b, lowerQuery)

      if (scoreA !== scoreB) {
        return scoreB - scoreA // Higher score first
      }

      // Tie-breaker: prefer foods with displayName
      if (a.displayName && !b.displayName) return -1
      if (!a.displayName && b.displayName) return 1

      // Final tie-breaker: alphabetical by display name or description
      const nameA = a.displayName || a.description
      const nameB = b.displayName || b.description
      return nameA.localeCompare(nameB)
    })
  }

  /**
   * Calculate relevance score for search result ranking
   * @param food - Food item from database
   * @param query - Lowercase search query
   * @returns Relevance score (higher = more relevant)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateRelevanceScore(food: any, query: string): number {
    let score = 0

    const displayName = (food.displayName || '').toLowerCase()
    const description = food.description.toLowerCase()

    // Exact match in displayName gets highest score
    if (displayName === query) {
      score += 100
    }
    // Starts with query in displayName
    else if (displayName.startsWith(query)) {
      score += 80
    }
    // Contains query in displayName
    else if (displayName.includes(query)) {
      score += 60
    }
    // Exact match in description
    else if (description === query) {
      score += 50
    }
    // Starts with query in description
    else if (description.startsWith(query)) {
      score += 40
    }
    // Contains query in description
    else if (description.includes(query)) {
      score += 20
    }

    // Bonus points for having a friendly displayName
    if (food.displayName) {
      score += 10
    }

    // Bonus for shorter names (often more specific/relevant)
    const nameLength = (food.displayName || food.description).length
    if (nameLength < 30) {
      score += 5
    }

    return score
  }

  /**
   * Get a specific USDA food by FDC ID
   * @param fdcId - USDA FDC ID (unique identifier)
   * @returns Promise<USDASearchResult | null> - The food or null if not found
   */
  async getFoodByFdcId(fdcId: number): Promise<USDASearchResult | null> {
    try {
      const food = await prisma.uSDAFood.findUnique({
        where: { fdcId },
      })

      return food ? transformUSDAFoodToResult(food) : null
    } catch (error) {
      console.error('USDA get food error:', error)
      return null
    }
  }

  /**
   * Get comprehensive statistics about USDA database content
   * Useful for admin panels and monitoring data quality
   * @returns Promise<USDAStats> - Database statistics
   */
  async getStats(): Promise<USDAStats> {
    try {
      const [total, srLegacy, foundation, withCalories] = await Promise.all([
        prisma.uSDAFood.count(),
        prisma.uSDAFood.count({ where: { dataType: 'sr_legacy_food' } }),
        prisma.uSDAFood.count({ where: { dataType: 'foundation_food' } }),
        prisma.uSDAFood.count({ where: { caloriesPer100g: { not: null } } }),
      ])

      return {
        total,
        srLegacy,
        foundation,
        withCalories,
        completionRate: total > 0 ? (withCalories / total) * 100 : 0,
      }
    } catch (error) {
      console.error('USDA stats error:', error)
      return {
        total: 0,
        srLegacy: 0,
        foundation: 0,
        withCalories: 0,
        completionRate: 0,
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of USDA search service
 * Use this for all USDA food searches throughout the application
 */
export const usdaSearchService = new USDASearchService()
