// Types for OpenFoodFacts API response
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
  nutriments?: {
    // Energy values
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

    // Macronutrients
    proteins?: number | string
    proteins_100g?: number | string
    proteins_serving?: number | string
    proteins_unit?: string
    proteins_value?: number | string

    carbohydrates?: number
    carbohydrates_100g?: number
    carbohydrates_serving?: number
    carbohydrates_unit?: string
    carbohydrates_value?: number

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

    // Other nutrients
    fiber_100g?: number | string

    sugars?: number
    sugars_100g?: number
    sugars_serving?: number
    sugars_unit?: string
    sugars_value?: number

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

    // Nutrition scores and other indicators
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
  brands?: string
  // Serving information
  servingQuantity?: number
  servingSize?: string
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
          brands: product.brands,
          // Convert all nutrition values to numbers explicitly
          caloriesPer100g:
            Number(product.nutriments?.['energy-kcal_100g']) || 0,
          proteinPer100g: Number(product.nutriments?.proteins_100g) || 0,
          carbsPer100g: Number(product.nutriments?.carbohydrates_100g) || 0,
          fatPer100g: Number(product.nutriments?.fat_100g) || 0,
          fiberPer100g: Number(product.nutriments?.fiber_100g) || 0,
          // Serving information
          servingQuantity: product.serving_quantity
            ? Number(product.serving_quantity)
            : undefined,
          servingSize: product.serving_size || undefined,
        }),
      ) || []
    )
  } catch (error) {
    console.error('Food search error:', error)
    throw error
  }
}
