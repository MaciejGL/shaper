import { type USDASearchResult, usdaSearchService } from './usda-search'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Energy and calorie related fields from OpenFoodFacts
 */
interface EnergyNutriments {
  energy?: number
  'energy-kcal'?: number
  'energy-kcal_100g'?: number
  'energy-kcal_serving'?: number | string
  'energy-kcal_unit'?: string
  'energy-kcal_value'?: number
  'energy-kcal_value_computed'?: number
  'energy-kj'?: number
  'energy-kj_100g'?: number
  'energy-kj_serving'?: number | string
  'energy-kj_unit'?: string
  'energy-kj_value'?: number
  'energy-kj_value_computed'?: number | string
  energy_100g?: number
  energy_serving?: number | string
  energy_unit?: string
  energy_value?: number
}

/**
 * Macronutrient fields from OpenFoodFacts
 */
interface MacroNutriments {
  // Proteins
  proteins?: number | string
  proteins_100g?: number | string
  proteins_serving?: number | string
  proteins_unit?: string
  proteins_value?: number | string

  // Carbohydrates
  carbohydrates?: number
  carbohydrates_100g?: number
  carbohydrates_serving?: number
  carbohydrates_unit?: string
  carbohydrates_value?: number

  // Fats
  fat?: number
  fat_100g?: number
  fat_serving?: number | string
  fat_unit?: string
  fat_value?: number

  // Fat subtypes
  'saturated-fat'?: number | string
  'saturated-fat_100g'?: number | string
  'saturated-fat_serving'?: number | string
  'saturated-fat_unit'?: string
  'saturated-fat_value'?: number | string

  'monounsaturated-fat'?: number | string
  'monounsaturated-fat_100g'?: number | string
  'monounsaturated-fat_serving'?: number | string
  'monounsaturated-fat_unit'?: string
  'monounsaturated-fat_value'?: number | string

  'polyunsaturated-fat'?: number | string
  'polyunsaturated-fat_100g'?: number | string
  'polyunsaturated-fat_serving'?: number | string
  'polyunsaturated-fat_unit'?: string
  'polyunsaturated-fat_value'?: number | string
}

/**
 * Other nutrient fields from OpenFoodFacts
 */
interface OtherNutriments {
  // Fiber and sugars
  fiber_100g?: number | string
  sugars?: number
  sugars_100g?: number
  sugars_serving?: number
  sugars_unit?: string
  sugars_value?: number

  // Salt and sodium
  salt?: number | string
  salt_100g?: number | string
  salt_serving?: number | string
  salt_unit?: string
  salt_value?: number | string

  sodium?: number | string
  sodium_100g?: number | string
  sodium_serving?: number | string
  sodium_unit?: string
  sodium_value?: number | string

  // Nutrition scores and indicators
  'nova-group'?: number
  'nova-group_100g'?: number
  'nova-group_serving'?: number
  'nutrition-score-fr'?: number
  'nutrition-score-fr_100g'?: number

  // Fruits and vegetables estimates
  'fruits-vegetables-legumes-estimate-from-ingredients_100g'?: number
  'fruits-vegetables-legumes-estimate-from-ingredients_serving'?: number
  'fruits-vegetables-nuts-estimate-from-ingredients_100g'?: number
  'fruits-vegetables-nuts-estimate-from-ingredients_serving'?: number
}

/**
 * Complete nutriment data from OpenFoodFacts API
 */
type OpenFoodFactsNutriments = EnergyNutriments &
  MacroNutriments &
  OtherNutriments

/**
 * OpenFoodFacts product data structure
 */
export interface OpenFoodFactsProduct {
  product_name: string
  code: string
  brands?: string
  allergens?: string
  image_front_url?: string
  image_url?: string
  ingredients_text?: string
  serving_quantity?: number | string
  serving_size?: string
  nutriments?: OpenFoodFactsNutriments
}

/**
 * OpenFoodFacts API search response
 */
export interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[]
}

/**
 * Unified search result interface for UI components
 */
export interface SearchResult {
  name: string
  // Source identification
  source: 'usda' | 'openfoodfacts'
  // IDs
  openFoodFactsId?: string // For OpenFoodFacts products
  usdaFdcId?: number // For USDA foods
  // Nutrition data (per 100g)
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
  // Brand information
  brands?: string
  // Serving information
  servingQuantity?: number
  servingSize?: string
  // USDA specific
  dataType?: string // sr_legacy_food, foundation_food, etc.
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely convert any value to number, returning 0 for invalid values
 */
function safeNumberConversion(value: unknown): number {
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

/**
 * Convert USDA search result to unified SearchResult format
 */
function convertUSDAToSearchResult(usda: USDASearchResult): SearchResult {
  return {
    name: usda.name,
    source: 'usda',
    usdaFdcId: usda.fdcId,
    caloriesPer100g: usda.caloriesPer100g || 0,
    proteinPer100g: usda.proteinPer100g || 0,
    carbsPer100g: usda.carbsPer100g || 0,
    fatPer100g: usda.fatPer100g || 0,
    fiberPer100g: usda.fiberPer100g || 0,
    brands: usda.brandOwner || usda.brandName,
    dataType: usda.dataType,
  }
}

/**
 * Convert OpenFoodFacts product to unified SearchResult format
 */
function convertOpenFoodFactsToSearchResult(
  product: OpenFoodFactsProduct,
): SearchResult {
  return {
    name: product.product_name,
    source: 'openfoodfacts',
    openFoodFactsId: product.code,
    brands: product.brands,
    // Convert nutrition values safely
    caloriesPer100g: safeNumberConversion(
      product.nutriments?.['energy-kcal_100g'],
    ),
    proteinPer100g: safeNumberConversion(product.nutriments?.proteins_100g),
    carbsPer100g: safeNumberConversion(product.nutriments?.carbohydrates_100g),
    fatPer100g: safeNumberConversion(product.nutriments?.fat_100g),
    fiberPer100g: safeNumberConversion(product.nutriments?.fiber_100g),
    // Serving information
    servingQuantity: product.serving_quantity
      ? safeNumberConversion(product.serving_quantity)
      : undefined,
    servingSize: product.serving_size || undefined,
  }
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search OpenFoodFacts API for food products
 * @param query - The search term
 * @returns Promise<SearchResult[]> - OpenFoodFacts results only
 */
async function searchOpenFoodFacts(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `/api/food/search?q=${encodeURIComponent(query)}`,
  )

  if (!response.ok) {
    throw new Error('OpenFoodFacts search failed')
  }

  const data: OpenFoodFactsSearchResponse = await response.json()

  return data.products?.map(convertOpenFoodFactsToSearchResult) || []
}

/**
 * Main hybrid search function combining USDA and OpenFoodFacts
 * Prioritizes USDA results (complete nutrition data) over OpenFoodFacts (brand products)
 * @param query - The search term
 * @returns Promise<SearchResult[]> - Array of search results prioritizing USDA
 */
export async function searchFoods(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return []

  try {
    // Search both sources in parallel for optimal performance
    const [usdaResults, openFoodFactsResults] = await Promise.allSettled([
      usdaSearchService.searchFoods(query, 10), // Local USDA database (fast)
      searchOpenFoodFacts(query), // OpenFoodFacts API (slower)
    ])

    const results: SearchResult[] = []

    // Add USDA results first (highest priority - complete nutrition data)
    if (usdaResults.status === 'fulfilled' && usdaResults.value.length > 0) {
      const convertedUSDA = usdaResults.value.map(convertUSDAToSearchResult)
      results.push(...convertedUSDA)
    }

    // Add OpenFoodFacts results (brand products, international foods)
    if (
      openFoodFactsResults.status === 'fulfilled' &&
      openFoodFactsResults.value.length > 0
    ) {
      results.push(...openFoodFactsResults.value)
    }

    // Return balanced mix (max 20 results total)
    return results.slice(0, 20)
  } catch (error) {
    console.error('Hybrid food search error:', error)

    // Graceful fallback to OpenFoodFacts only
    try {
      return await searchOpenFoodFacts(query)
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError)
      return []
    }
  }
}
