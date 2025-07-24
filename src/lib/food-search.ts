// ============================================================================
// UNIFIED FOOD SEARCH - Uses Local Database via API
// ============================================================================
// This module provides a simplified interface to the food search API
// The API endpoint already handles both USDA and OpenFoodFacts searches
// using local databases for optimal performance.

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

/**
 * Main search function that uses the optimized API endpoint
 * The API endpoint handles both USDA and OpenFoodFacts searches using local databases
 * @param query - The search term
 * @param country - Optional country filter (defaults to Norway on backend)
 * @returns Promise<SearchResult[]> - Array of search results from both sources
 */
export async function searchFoods(
  query: string,
  country?: string,
): Promise<SearchResult[]> {
  if (query.length < 2) return []

  try {
    const url = new URL('/api/food/search', window.location.origin)
    url.searchParams.set('q', query)
    if (country) {
      url.searchParams.set('country', country)
    }

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const results: SearchResult[] = await response.json()
    return results
  } catch (error) {
    console.error('Food search error:', error)
    return []
  }
}
