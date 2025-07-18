import type { OpenFoodFactsProduct } from '@prisma/client'

import { prisma } from '@/lib/db'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * OpenFoodFacts search result interface for external consumption
 */
export interface OpenFoodFactsSearchResult {
  id: string
  code: string
  name: string
  source: 'openfoodfacts'
  // Brand and classification
  brands?: string
  categories?: string
  countries?: string
  labels?: string
  // Nutrition data (per 100g)
  caloriesPer100g?: number
  proteinPer100g?: number
  carbsPer100g?: number
  fatPer100g?: number
  fiberPer100g?: number
  sugarPer100g?: number
  saltPer100g?: number
  sodiumPer100g?: number
  // Quality indicators
  nutriScore?: string
  novaGroup?: number
  ecoScore?: string
  // Serving information
  servingSize?: string
  servingQuantity?: number
  // Images
  imageUrl?: string
  imageFrontUrl?: string
  // Data quality
  completeness?: number
  scansN?: number
}

/**
 * Database statistics for OpenFoodFacts data
 */
export interface OpenFoodFactsStats {
  total: number
  withNutrition: number
  withImages: number
  withNutriScore: number
  completionRate: number
  avgCompleteness: number
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transform a Prisma OpenFoodFactsProduct record to OpenFoodFactsSearchResult
 * Centralizes the data transformation logic to avoid repetition
 */
function transformOpenFoodFactsProductToResult(
  product: OpenFoodFactsProduct,
): OpenFoodFactsSearchResult {
  return {
    id: product.id,
    code: product.code,
    name: product.productName,
    source: 'openfoodfacts',
    brands: product.brands || undefined,
    categories: product.categories || undefined,
    countries: product.countries || undefined,
    labels: product.labels || undefined,
    caloriesPer100g: product.energyKcal100g || undefined,
    proteinPer100g: product.proteins100g || undefined,
    carbsPer100g: product.carbohydrates100g || undefined,
    fatPer100g: product.fat100g || undefined,
    fiberPer100g: product.fiber100g || undefined,
    sugarPer100g: product.sugars100g || undefined,
    saltPer100g: product.salt100g || undefined,
    sodiumPer100g: product.sodium100g || undefined,
    nutriScore: product.nutriScore || undefined,
    novaGroup: product.novaGroup || undefined,
    ecoScore: product.ecoScore || undefined,
    servingSize: product.servingSize || undefined,
    servingQuantity: product.servingQuantity || undefined,
    imageUrl: product.imageUrl || undefined,
    imageFrontUrl: product.imageFrontUrl || undefined,
    completeness: product.completeness || undefined,
    scansN: product.scansN || undefined,
  }
}

/**
 * Get filter for products with meaningful nutrition data
 * Only includes products that have at least calories or other key nutrients
 */
function getNutritionDataFilter() {
  return {
    OR: [
      { energyKcal100g: { not: null } },
      { proteins100g: { not: null } },
      { carbohydrates100g: { not: null } },
      { fat100g: { not: null } },
    ],
  }
}

/**
 * Get ordering strategy for search results
 * Prioritizes products with higher data quality and popularity
 */
function getSearchOrdering() {
  return [
    // First by completeness (higher data quality)
    { completeness: 'desc' as const },
    // Then by scan count (popularity indicator)
    { scansN: 'desc' as const },
    // Finally by name for consistency
    { productName: 'asc' as const },
  ]
}

// ============================================================================
// SEARCH SERVICE CLASS
// ============================================================================

export class OpenFoodFactsSearchService {
  /**
   * Search OpenFoodFacts products in local database with intelligent filtering and ordering
   * @param query - Search term (minimum 2 characters)
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of matching products
   */
  async searchProducts(
    query: string,
    limit = 10,
  ): Promise<OpenFoodFactsSearchResult[]> {
    if (query.length < 2) return []

    try {
      const products = await prisma.openFoodFactsProduct.findMany({
        where: {
          AND: [
            // Search terms filter
            {
              OR: [
                {
                  productName: {
                    contains: query,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  brands: {
                    contains: query,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  categories: {
                    contains: query,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
            // Nutrition data filter
            getNutritionDataFilter(),
          ],
        },
        take: limit,
        orderBy: getSearchOrdering(),
      })

      return products.map(transformOpenFoodFactsProductToResult)
    } catch (error) {
      console.error('OpenFoodFacts search error:', error)
      // Return empty results instead of throwing to allow graceful fallback
      return []
    }
  }

  /**
   * Get a specific OpenFoodFacts product by barcode
   * @param code - Product barcode/code (unique identifier)
   * @returns Promise<OpenFoodFactsSearchResult | null> - The product or null if not found
   */
  async getProductByCode(
    code: string,
  ): Promise<OpenFoodFactsSearchResult | null> {
    try {
      const product = await prisma.openFoodFactsProduct.findUnique({
        where: { code },
      })

      return product ? transformOpenFoodFactsProductToResult(product) : null
    } catch (error) {
      console.error('OpenFoodFacts get product error:', error)
      return null
    }
  }

  /**
   * Search products by category with optional additional filters
   * @param category - Category name to search within
   * @param additionalQuery - Optional additional search term
   * @param limit - Maximum number of results (default: 20)
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of matching products
   */
  async searchByCategory(
    category: string,
    additionalQuery?: string,
    limit = 20,
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        AND: [
          // Category filter
          {
            categories: {
              contains: category,
              mode: 'insensitive',
            },
          },
          // Nutrition data filter
          getNutritionDataFilter(),
        ],
      }

      // Add additional query filter if provided
      if (additionalQuery && additionalQuery.length >= 2) {
        whereClause.AND.push({
          OR: [
            {
              productName: {
                contains: additionalQuery,
                mode: 'insensitive',
              },
            },
            {
              brands: {
                contains: additionalQuery,
                mode: 'insensitive',
              },
            },
          ],
        })
      }

      const products = await prisma.openFoodFactsProduct.findMany({
        where: whereClause,
        take: limit,
        orderBy: getSearchOrdering(),
      })

      return products.map(transformOpenFoodFactsProductToResult)
    } catch (error) {
      console.error('OpenFoodFacts category search error:', error)
      return []
    }
  }

  /**
   * Get comprehensive statistics about OpenFoodFacts database content
   * Useful for admin panels and monitoring data quality
   * @returns Promise<OpenFoodFactsStats> - Database statistics
   */
  async getStats(): Promise<OpenFoodFactsStats> {
    try {
      const [
        total,
        withNutrition,
        withImages,
        withNutriScore,
        avgCompletenessResult,
      ] = await Promise.all([
        prisma.openFoodFactsProduct.count(),
        prisma.openFoodFactsProduct.count({
          where: { energyKcal100g: { not: null } },
        }),
        prisma.openFoodFactsProduct.count({
          where: { imageUrl: { not: null } },
        }),
        prisma.openFoodFactsProduct.count({
          where: { nutriScore: { not: null } },
        }),
        prisma.openFoodFactsProduct.aggregate({
          _avg: { completeness: true },
        }),
      ])

      const avgCompleteness = avgCompletenessResult._avg.completeness || 0

      return {
        total,
        withNutrition,
        withImages,
        withNutriScore,
        completionRate: total > 0 ? (withNutrition / total) * 100 : 0,
        avgCompleteness,
      }
    } catch (error) {
      console.error('OpenFoodFacts stats error:', error)
      return {
        total: 0,
        withNutrition: 0,
        withImages: 0,
        withNutriScore: 0,
        completionRate: 0,
        avgCompleteness: 0,
      }
    }
  }

  /**
   * Get popular products (based on scan count) with optional category filter
   * @param category - Optional category filter
   * @param limit - Maximum number of results (default: 20)
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of popular products
   */
  async getPopularProducts(
    category?: string,
    limit = 20,
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        scansN: { not: null, gt: 0 },
        // Only include products with nutrition data
        ...getNutritionDataFilter(),
      }

      if (category) {
        whereClause.categories = {
          contains: category,
          mode: 'insensitive',
        }
      }

      const products = await prisma.openFoodFactsProduct.findMany({
        where: whereClause,
        take: limit,
        orderBy: [
          { scansN: 'desc' },
          { completeness: 'desc' },
          { productName: 'asc' },
        ],
      })

      return products.map(transformOpenFoodFactsProductToResult)
    } catch (error) {
      console.error('OpenFoodFacts popular products error:', error)
      return []
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of OpenFoodFacts search service
 * Use this for all OpenFoodFacts product searches throughout the application
 */
export const openFoodFactsSearchService = new OpenFoodFactsSearchService()
