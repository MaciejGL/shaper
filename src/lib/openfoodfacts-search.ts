import type { OpenFoodFactsProduct, Prisma } from '@prisma/client'

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

// ============================================================================
// SEARCH SERVICE CLASS
// ============================================================================

export class OpenFoodFactsSearchService {
  /**
   * Search OpenFoodFacts products in local database with intelligent filtering and ordering
   *
   * PERFORMANCE STRATEGY:
   * 1. Fast database query without country filter (uses productName index)
   * 2. Post-processing to prioritize country-specific results
   * 3. This avoids slow database queries while still prioritizing local products
   *
   * @param query - Search term (minimum 2 characters)
   * @param limit - Maximum number of results (default: 10)
   * @param country - Preferred country for results (default: 'Norway')
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of matching products
   *
   * @example
   * // Default Norway search
   * await searchProducts('porridge')
   *
   * // Search for specific country
   * await searchProducts('porridge', 10, 'Sweden')
   */
  async searchProducts(
    query: string,
    limit = 10,
    country = 'Norway',
  ): Promise<OpenFoodFactsSearchResult[]> {
    if (query.length < 2) return []

    try {
      let products = await prisma.openFoodFactsProduct.findMany({
        where: {
          productName: {
            contains: query,
            mode: 'insensitive' as const,
          },
          // Simple nutrition filter - at least calories OR protein
          OR: [
            { energyKcal100g: { not: null } },
            { proteins100g: { not: null } },
          ],
        },
        take: limit,
        // Simple ordering for speed
        orderBy: {
          productName: 'asc',
        },
      })

      // If no results with nutrition filter, try without it as fallback
      if (products.length === 0) {
        products = await prisma.openFoodFactsProduct.findMany({
          where: {
            productName: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
          take: limit,
          orderBy: {
            productName: 'asc',
          },
        })
      }

      // FAST POST-PROCESSING: Prioritize country-specific results without slowing down the query
      let finalProducts = products

      if (country && products.length > 0) {
        const countryProducts: typeof products = []
        const otherProducts: typeof products = []

        for (const product of products) {
          if (
            product.countries?.toLowerCase().includes(country.toLowerCase())
          ) {
            countryProducts.push(product)
          } else {
            otherProducts.push(product)
          }
        }

        // Combine: country-specific first, then others, up to the limit
        finalProducts = [
          ...countryProducts,
          ...otherProducts.slice(
            0,
            Math.max(0, limit - countryProducts.length),
          ),
        ].slice(0, limit)
      }

      return finalProducts.map(transformOpenFoodFactsProductToResult)
    } catch (error) {
      console.error('OpenFoodFacts search error:', error)
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
   * Uses the same performance strategy as main search: fast query + post-processing
   *
   * @param category - Category name to search within
   * @param additionalQuery - Optional additional search term
   * @param limit - Maximum number of results (default: 20)
   * @param country - Preferred country for results (default: 'Norway')
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of matching products
   */
  async searchByCategory(
    category: string,
    additionalQuery?: string,
    limit = 20,
    country = 'Norway',
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // FAST QUERY: Skip country filtering for performance
      const whereClause: Prisma.OpenFoodFactsProductWhereInput = {
        AND: [
          // Category filter
          {
            categories: {
              contains: category,
              mode: 'insensitive',
            },
          },
          // Nutrition data filter
          {
            OR: [
              { energyKcal100g: { not: null } },
              { proteins100g: { not: null } },
            ],
          },
        ],
      }

      // Add additional query filter if provided
      if (
        additionalQuery &&
        additionalQuery.length >= 2 &&
        Array.isArray(whereClause.AND)
      ) {
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

      let products = await prisma.openFoodFactsProduct.findMany({
        where: whereClause,
        take: limit * 2, // Get more to allow for country filtering
        orderBy: {
          productName: 'asc',
        },
      })

      // FAST POST-PROCESSING: Prioritize country-specific results
      if (country && products.length > 0) {
        const countryProducts: typeof products = []
        const otherProducts: typeof products = []

        for (const product of products) {
          if (
            product.countries?.toLowerCase().includes(country.toLowerCase())
          ) {
            countryProducts.push(product)
          } else {
            otherProducts.push(product)
          }
        }

        products = [
          ...countryProducts,
          ...otherProducts.slice(
            0,
            Math.max(0, limit - countryProducts.length),
          ),
        ].slice(0, limit)
      }

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
   * @param country - Preferred country for results (default: 'Norway')
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of popular products
   */
  async getPopularProducts(
    category?: string,
    limit = 20,
    country = 'Norway',
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        scansN: { not: null, gt: 0 },
        // Country preference filter
        countries: {
          contains: country,
          mode: 'insensitive',
        },
        // Only include products with nutrition data
        OR: [
          { energyKcal100g: { not: null } },
          { proteins100g: { not: null } },
          { carbohydrates100g: { not: null } },
          { fat100g: { not: null } },
        ],
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
