import type { OpenFoodFactsProduct, Prisma } from '@/generated/prisma/client'
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
// SEARCH CONFIGURATION
// ============================================================================

/**
 * Configuration for OpenFoodFacts search quality and deduplication
 *
 * 🎛️ TWEAKING GUIDE:
 *
 * FOR SPEED (prioritize fast response):
 * - Set quality.enableQualityFilter = false (disables quality filters)
 * - Reduce fetch.multiplier to 1.2 (fetch fewer items)
 * - Set deduplication.enableDeduplication = false (skip deduplication)
 * - Increase deduplication.maxGroupsToProcess limit
 *
 * FOR QUALITY (prioritize better results):
 * - Increase quality.minCompleteness (0.15 → 0.3)
 * - Increase fetch.multiplier (1.5 → 2.5) for better deduplication
 * - Decrease deduplication.completenessThreshold (0.15 → 0.05) for stricter matching
 *
 * FOR DEBUGGING:
 * - Set logging.enableSearchLogs = true to see performance metrics
 */
const SEARCH_CONFIG = {
  // Quality thresholds for filtering products
  quality: {
    minCompleteness: 0.15, // Minimum data completeness (lowered for speed)
    minScans: 1, // Minimum number of scans (lowered for speed)
    minUniqueScans: 1, // Minimum unique user scans
    enableQualityFilter: true, // Toggle quality filtering entirely
  },

  // Search fetch strategy
  fetch: {
    multiplier: 1.5, // Fetch this many times the requested limit for better filtering (optimized for speed)
    minFetch: 15, // Minimum number of products to fetch (optimized for speed)
    maxFetch: 50, // Maximum products to fetch to prevent slow queries
  },

  // Deduplication quality comparison thresholds
  deduplication: {
    completenessThreshold: 0.15, // Products within this completeness range are considered equal
    scansThreshold: 10, // Products within this scan count range are considered equal
    enableDeduplication: true, // Toggle deduplication on/off
    maxGroupsToProcess: 20, // Limit deduplication processing for speed
  },

  // Product name normalization rules
  normalization: {
    // Terms to remove from product names for similarity grouping
    percentageTerms: /\b\d+%\s*/g,
    marketingTerms: /\b(organic|natural|pure|premium|select|choice)\b/g,
    completenessTerms: /\b(100%|whole|complete|full)\b/g,
    preparationTerms:
      /\b(quick|instant|old\s+fashioned|traditional|steel\s+cut)\b/g,
    originTerms: /\b(australian\s+grown|imported|local|farm|grown)\b/g,
    redundantTerms: /\b(grain|cereal)\b/g,
    sizeTerms: /\b(large|small|medium|family\s+size)\b/g,

    // Fallback strategy when normalized name becomes too short
    fallbackWordCount: 2, // Use first N words from original name
  },

  // Logging preferences
  logging: {
    enableSearchLogs: true,
    enableDeduplicationLogs: true,
  },
} as const

// Export config for external tweaking if needed
export { SEARCH_CONFIG }

// ============================================================================
// SEARCH SERVICE CLASS
// ============================================================================

export class OpenFoodFactsSearchService {
  /**
   * Enhanced search with quality-based ranking and smart deduplication
   *
   * QUALITY & DEDUPLICATION STRATEGY:
   * 1. Quality-based ranking: completeness > popularity (scans) > uniqueness
   * 2. Smart deduplication: groups similar products, picks best from each group
   * 3. Minimum quality thresholds to filter out poor data
   * 4. Fallback search with relaxed filters if needed
   * 5. Uses optimized database indexes for performance
   *
   * DEDUPLICATION EXAMPLES:
   * - "100% whole grain Australian grown oats"
   * - "100% whole grain cereal quick oats"
   * - "100% whole grain oats"
   * → Returns only the highest quality "oats" product
   *
   * @param query - Search term (minimum 2 characters)
   * @param limit - Maximum number of results (default: 10)
   * @param country - Country to limit results to (default: 'Norway')
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of high-quality, unique products
   *
   * @example
   * // Returns top quality, deduplicated oats products
   * await searchProducts('oats', 10)
   *
   * // Returns best quality yogurt products without duplicates
   * await searchProducts('yogurt', 5, 'Norway')
   */
  async searchProducts(
    query: string,
    limit = 10,
    country = 'Norway',
  ): Promise<OpenFoodFactsSearchResult[]> {
    // Note: country parameter available for future country filtering implementation
    console.info(`🔍 Searching OpenFoodFacts for "${query}" in ${country}`)
    if (query.length < 2) return []

    try {
      // Fetch more results initially to allow for deduplication and quality filtering
      const fetchLimit = Math.min(
        Math.max(
          limit * SEARCH_CONFIG.fetch.multiplier,
          SEARCH_CONFIG.fetch.minFetch,
        ),
        SEARCH_CONFIG.fetch.maxFetch,
      )

      // PERFORMANCE OPTIMIZATION: Use the fastest possible query

      const whereConditions: Prisma.OpenFoodFactsProductWhereInput[] = [
        {
          productName: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        // Always require nutrition data for relevance
        {
          OR: [
            { energyKcal100g: { not: null } },
            { proteins100g: { not: null } },
          ],
        },
      ]

      // Only add quality filters if enabled (they can slow down queries significantly)
      if (SEARCH_CONFIG.quality.enableQualityFilter) {
        whereConditions.push({
          OR: [
            { completeness: { gte: SEARCH_CONFIG.quality.minCompleteness } },
            { scansN: { gte: SEARCH_CONFIG.quality.minScans } },
            { uniqueScansN: { gte: SEARCH_CONFIG.quality.minUniqueScans } },
          ],
        })
      }

      let products = await prisma.openFoodFactsProduct.findMany({
        where: {
          AND: whereConditions,
        },
        take: fetchLimit,
        // Use the fastest index: off_fast_search_idx (productName, energyKcal100g)
        orderBy: [
          { productName: 'asc' }, // Use indexed field first for speed
          { scansN: 'desc' }, // Then popularity
          { completeness: 'desc' }, // Then quality
        ],
      })

      // PERFORMANCE: Skip expensive fallback query if we have reasonable results
      // Only do fallback if we have very few results AND quality filters are enabled
      if (
        products.length < Math.ceil(limit / 2) &&
        SEARCH_CONFIG.quality.enableQualityFilter
      ) {
        console.info(
          `🔄 Only found ${products.length} results, trying quick fallback...`,
        )

        const additionalProducts = await prisma.openFoodFactsProduct.findMany({
          where: {
            AND: [
              {
                productName: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
              // Exclude products we already found
              {
                NOT: {
                  id: {
                    in: products.map((p) => p.id),
                  },
                },
              },
              // Keep nutrition requirement for relevance
              {
                OR: [
                  { energyKcal100g: { not: null } },
                  { proteins100g: { not: null } },
                ],
              },
            ],
          },
          take: limit, // Only fetch what we need
          orderBy: { productName: 'asc' }, // Simple fast ordering
        })

        products = [...products, ...additionalProducts]
      }

      if (SEARCH_CONFIG.logging.enableSearchLogs) {
        console.info(
          `🔍 Found ${products.length} products before deduplication`,
        )
      }

      // Apply smart deduplication to remove similar items
      const deduplicatedProducts = SEARCH_CONFIG.deduplication
        .enableDeduplication
        ? this.deduplicateSimilarProducts(products, limit)
        : products.slice(0, limit)

      if (SEARCH_CONFIG.logging.enableDeduplicationLogs) {
        console.info(
          `✨ Deduplicated to ${deduplicatedProducts.length} unique products`,
        )
      }

      return deduplicatedProducts.map(transformOpenFoodFactsProductToResult)
    } catch (error) {
      console.error('OpenFoodFacts search error:', error)
      return []
    }
  }

  /**
   * Smart deduplication to remove similar product names while keeping the highest quality items
   *
   * STRATEGY:
   * 1. Normalize product names to group similar items
   * 2. Within each group, pick the product with best quality metrics
   * 3. Prioritize: completeness > popularity (scans) > shorter names
   *
   * @param products - Array of products to deduplicate
   * @param limit - Maximum number of results to return
   * @returns Deduplicated array of best quality products
   */
  private deduplicateSimilarProducts(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: any[],
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    const productGroups = new Map<string, typeof products>()

    // Group products by normalized name
    for (const product of products) {
      const normalizedName = this.normalizeProductName(product.productName)

      if (!productGroups.has(normalizedName)) {
        productGroups.set(normalizedName, [])
      }
      productGroups.get(normalizedName)!.push(product)
    }

    const deduplicatedProducts: typeof products = []
    let groupsProcessed = 0

    // Pick the best product from each group (with processing limit for speed)
    for (const groupProducts of productGroups.values()) {
      if (deduplicatedProducts.length >= limit) break
      if (groupsProcessed >= SEARCH_CONFIG.deduplication.maxGroupsToProcess)
        break

      groupsProcessed++

      // Sort products within group by quality metrics
      const bestProduct = groupProducts.sort((a, b) => {
        // Primary: Data completeness (higher is better)
        const completenessA = a.completeness || 0
        const completenessB = b.completeness || 0
        if (
          Math.abs(completenessA - completenessB) >
          SEARCH_CONFIG.deduplication.completenessThreshold
        ) {
          return completenessB - completenessA
        }

        // Secondary: Popularity (scan count - higher is better)
        const scansA = a.scansN || 0
        const scansB = b.scansN || 0
        if (
          Math.abs(scansA - scansB) > SEARCH_CONFIG.deduplication.scansThreshold
        ) {
          return scansB - scansA
        }

        // Tertiary: Unique users (higher is better)
        const uniqueScansA = a.uniqueScansN || 0
        const uniqueScansB = b.uniqueScansN || 0
        if (uniqueScansA !== uniqueScansB) {
          return uniqueScansB - uniqueScansA
        }

        // Final: Shorter, simpler names are often better (less brand-specific)
        return a.productName.length - b.productName.length
      })[0] // Take the best product from this group

      deduplicatedProducts.push(bestProduct)
    }

    // Sort final results by overall quality for consistent ordering
    return deduplicatedProducts
      .sort((a, b) => {
        const completenessA = a.completeness || 0
        const completenessB = b.completeness || 0
        if (
          Math.abs(completenessA - completenessB) >
          SEARCH_CONFIG.deduplication.completenessThreshold / 2
        ) {
          return completenessB - completenessA
        }

        const scansA = a.scansN || 0
        const scansB = b.scansN || 0
        return scansB - scansA
      })
      .slice(0, limit)
  }

  /**
   * Normalize product name for similarity grouping
   *
   * NORMALIZATION RULES:
   * 1. Convert to lowercase
   * 2. Remove brand/marketing terms (organic, 100%, etc.)
   * 3. Remove preparation methods (quick, old fashioned, etc.)
   * 4. Remove origin descriptors (Australian grown, etc.)
   * 5. Standardize whitespace
   *
   * Example: "100% Whole Grain Australian Grown Oats" → "grain oats"
   */
  private normalizeProductName(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        // Remove percentage indicators
        .replace(SEARCH_CONFIG.normalization.percentageTerms, '')
        // Remove common marketing/quality terms
        .replace(SEARCH_CONFIG.normalization.marketingTerms, '')
        // Remove completeness indicators
        .replace(SEARCH_CONFIG.normalization.completenessTerms, '')
        // Remove preparation/processing terms
        .replace(SEARCH_CONFIG.normalization.preparationTerms, '')
        // Remove origin/source terms
        .replace(SEARCH_CONFIG.normalization.originTerms, '')
        // Remove grain/cereal descriptors that are often redundant
        .replace(SEARCH_CONFIG.normalization.redundantTerms, '')
        // Remove size/packaging terms
        .replace(SEARCH_CONFIG.normalization.sizeTerms, '')
        // Remove extra whitespace and normalize
        .replace(/\s+/g, ' ')
        .trim() ||
      // If result is too short, use first N significant words from original
      name
        .toLowerCase()
        .split(' ')
        .slice(0, SEARCH_CONFIG.normalization.fallbackWordCount)
        .join(' ')
    )
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
   * Search products by category with strict country filtering
   * Uses database-level filtering to ensure only country-specific results
   *
   * @param category - Category name to search within
   * @param additionalQuery - Optional additional search term
   * @param limit - Maximum number of results (default: 20)
   * @param country - Country to limit results to (default: 'Norway')
   * @returns Promise<OpenFoodFactsSearchResult[]> - Array of matching products from specified country only
   */
  async searchByCategory(
    category: string,
    additionalQuery?: string,
    limit = 20,
    country = 'Norway',
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // STRICT COUNTRY-FILTERED QUERY
      const whereClause: Prisma.OpenFoodFactsProductWhereInput = {
        AND: [
          // Category filter
          {
            categories: {
              contains: category,
              mode: 'insensitive',
            },
          },
          // STRICT COUNTRY FILTER: Only products from specified country
          {
            countries: {
              contains: country,
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

      const products = await prisma.openFoodFactsProduct.findMany({
        where: whereClause,
        take: limit, // No need to get extra since we filter at database level
        orderBy: {
          productName: 'asc',
        },
      })

      console.info(
        `🇳🇴 Category search for "${category}" in ${country}: ${products.length} results`,
      )

      // No post-processing needed since we filter at database level
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
