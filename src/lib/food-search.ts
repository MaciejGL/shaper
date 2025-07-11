// Types for OpenFoodFacts API response
export interface OpenFoodFactsProduct {
  product_name: string
  code: string
  nutriments?: {
    'energy-kcal_100g'?: number | string
    proteins_100g?: number | string
    carbohydrates_100g?: number | string
    fat_100g?: number | string
    fiber_100g?: number | string
  }
}

export interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[]
}

// Type for search results displayed in UI
export interface SearchResult {
  name: string
  openFoodFactsId: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g: number
}

/**
 * Search for foods using the OpenFoodFacts API
 * @param query - The search term
 * @returns Promise<SearchResult[]> - Array of search results
 */
export async function searchFoods(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return []

  try {
    const response = await fetch(
      `/api/food/search?q=${encodeURIComponent(query)}`,
    )
    if (!response.ok) throw new Error('Search failed')

    const data: OpenFoodFactsSearchResponse = await response.json()
    return (
      data.products?.map(
        (product: OpenFoodFactsProduct): SearchResult => ({
          name: product.product_name,
          openFoodFactsId: product.code,
          // Convert all nutrition values to numbers explicitly
          caloriesPer100g:
            Number(product.nutriments?.['energy-kcal_100g']) || 0,
          proteinPer100g: Number(product.nutriments?.proteins_100g) || 0,
          carbsPer100g: Number(product.nutriments?.carbohydrates_100g) || 0,
          fatPer100g: Number(product.nutriments?.fat_100g) || 0,
          fiberPer100g: Number(product.nutriments?.fiber_100g) || 0,
        }),
      ) || []
    )
  } catch (error) {
    console.error('Food search error:', error)
    throw error
  }
}
