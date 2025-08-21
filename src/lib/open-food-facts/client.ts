import type { FoodProduct } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

interface OpenFoodFactsSearchResponse {
  products: OpenFoodFactsSearchResult[]
  count: number
  page: number
  page_count: number
  page_size: number
}

// Search results have a flattened structure (v1 API)
export interface OpenFoodFactsSearchResult {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
    fiber_100g?: number
    sugars_100g?: number
    salt_100g?: number
  }
  ingredients_text?: string
  allergens?: string
  image_url?: string
  image_front_url?: string
  serving_size?: string
  serving_quantity?: number
}

// Single product API has nested structure (v2 API)
interface OpenFoodFactsProduct {
  code: string
  product: {
    product_name: string
    brands?: string
    nutriments: {
      'energy-kcal_100g'?: number
      proteins_100g?: number
      carbohydrates_100g?: number
      fat_100g?: number
      fiber_100g?: number
      sugars_100g?: number
      salt_100g?: number
    }
    ingredients_text?: string
    allergens?: string
    image_url?: string
    image_front_url?: string
    serving_size?: string
    serving_quantity?: number
  }
  status: number
  status_verbose: string
}

interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

class OpenFoodFactsError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public barcode?: string,
  ) {
    super(message)
    this.name = 'OpenFoodFactsError'
  }
}

export class OpenFoodFactsClient {
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2'
  private readonly userAgent = 'ShaperApp/1.0 (https://shaper.app)'

  async getProduct(barcode: string): Promise<OpenFoodFactsProduct | null> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${barcode}`, {
        headers: {
          'User-Agent': this.userAgent,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 1) {
        return data
      }
      return null
    } catch (error) {
      console.error('Error fetching product from Open Food Facts:', error)
      return null
    }
  }

  async searchProducts(
    query: string,
    limit = 20,
    page = 1,
  ): Promise<OpenFoodFactsSearchResult[]> {
    try {
      // First try: Simple search without category filters for reliability
      const restrictedParams = new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: limit.toString(),
        page: page.toString(),
        sort_by: 'unique_scans_n',
        countries: 'Norway',
        // Prioritize basic ingredients over processed products
        fields:
          'code,product_name,brands,nutriments,image_url,image_front_url,serving_size,serving_quantity,ingredients_text,allergens',
      })

      let response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?${restrictedParams}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        },
      )

      if (!response.ok) {
        console.error(
          `OpenFoodFacts API error: ${response.status} ${response.statusText}`,
        )
        console.error(
          `Request URL: https://world.openfoodfacts.org/cgi/search.pl?${restrictedParams}`,
        )

        // For 429 (rate limit) or 503 (service unavailable), return empty results instead of throwing
        if (
          response.status === 429 ||
          response.status === 503 ||
          response.status >= 500
        ) {
          console.warn(
            `OpenFoodFacts API temporarily unavailable (${response.status}), returning empty results`,
          )
          return []
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let data: OpenFoodFactsSearchResponse = await response.json()

      // If we get few results, try even broader search
      if ((data.products || []).length < 5) {
        const broadParams = new URLSearchParams({
          search_terms: query,
          search_simple: '1',
          action: 'process',
          json: '1',
          page_size: limit.toString(),
          page: page.toString(),
          sort_by: 'unique_scans_n',
          fields:
            'code,product_name,brands,nutriments,image_url,image_front_url,serving_size,serving_quantity,ingredients_text,allergens',
        })

        try {
          response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?${broadParams}`,
            {
              headers: {
                'User-Agent': this.userAgent,
              },
              signal: AbortSignal.timeout(10000), // 10 second timeout
            },
          )

          if (response.ok) {
            data = await response.json()
          } else {
            console.warn(`Broader search failed with status ${response.status}`)
          }
        } catch (error) {
          console.warn('Broader search failed:', error)
          // Continue with original data
        }
      }

      // Filter results to prefer products with nutrition data, but don't exclude completely
      const filteredProducts = (data.products || []).filter((product) => {
        // At minimum, we need a product name
        return product.product_name && product.product_name.trim().length > 0
      })

      // Sort by nutrition data completeness and prefer basic ingredients
      const sortedProducts = filteredProducts.sort((a, b) => {
        const getRelevanceScore = (product: OpenFoodFactsSearchResult) => {
          const nutrients = product.nutriments || {}
          let score = 0

          // Boost nutrition data completeness
          if (nutrients['energy-kcal_100g'] !== undefined) score += 1
          if (nutrients.proteins_100g !== undefined) score += 1
          if (nutrients.carbohydrates_100g !== undefined) score += 1
          if (nutrients.fat_100g !== undefined) score += 1

          // Boost basic ingredients (less processing, simpler names)
          const name = product.product_name?.toLowerCase() || ''
          if (
            name.includes('fresh') ||
            name.includes('raw') ||
            name.includes('natural')
          )
            score += 2
          if (
            name.includes('breast') ||
            name.includes('thigh') ||
            name.includes('fillet')
          )
            score += 2
          if (name.includes('organic') || name.includes('økologisk')) score += 1

          // Penalize processed products
          if (
            name.includes('sausage') ||
            name.includes('processed') ||
            name.includes('cured')
          )
            score -= 2
          if (
            name.includes('sauce') ||
            name.includes('marinated') ||
            name.includes('seasoned')
          )
            score -= 1

          return score
        }

        return getRelevanceScore(b) - getRelevanceScore(a)
      })

      return sortedProducts
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  async searchProductsWithPagination(
    query: string,
    limit = 20,
    page = 1,
  ): Promise<OpenFoodFactsSearchResponse> {
    try {
      // Use the v1 search API which is more reliable
      const params = new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: limit.toString(),
        page: page.toString(),
        // Sort by popularity (scan count) to get more common products first
        sort_by: 'unique_scans_n',
        // Filter for Norwegian products to get local/relevant results
        countries: 'Norway',
        fields:
          'code,product_name,brands,nutriments,image_url,image_front_url,serving_size,serving_quantity,ingredients_text,allergens',
      })

      // Use the v1 search endpoint instead of v2
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        },
      )

      if (!response.ok) {
        console.error(
          `OpenFoodFacts pagination API error: ${response.status} ${response.statusText}`,
        )
        console.error(
          `Request URL: https://world.openfoodfacts.org/cgi/search.pl?${params}`,
        )

        // For 429 (rate limit) or 503 (service unavailable), return empty results instead of throwing
        if (
          response.status === 429 ||
          response.status === 503 ||
          response.status >= 500
        ) {
          console.warn(
            `OpenFoodFacts API temporarily unavailable (${response.status}), returning empty results`,
          )
          return {
            products: [],
            count: 0,
            page: 1,
            page_count: 0,
            page_size: limit,
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OpenFoodFactsSearchResponse = await response.json()

      return data
    } catch (error) {
      console.error('Error searching products with pagination:', error)
      return {
        products: [],
        count: 0,
        page: 1,
        page_count: 0,
        page_size: limit,
      }
    }
  }

  // Cache product data to reduce API calls
  async getCachedProduct(barcode: string): Promise<FoodProduct | null> {
    try {
      // First check database cache
      const cachedProduct = await prisma.foodProduct.findUnique({
        where: { openFoodFactsId: barcode },
      })

      // If found and not outdated, return cached version
      if (cachedProduct && !this.isOutdated(cachedProduct.lastUpdated)) {
        return cachedProduct
      }

      // Otherwise fetch from API and cache
      const apiProduct = await this.getProduct(barcode)
      if (apiProduct) {
        const cachedResult = await this.cacheProduct(apiProduct)
        return cachedResult
      }

      return null
    } catch (error) {
      console.error('Error getting cached product:', error)
      return null
    }
  }

  private isOutdated(lastUpdated: Date): boolean {
    const now = new Date()
    const daysSinceUpdate =
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 30 // Consider outdated after 30 days
  }

  private async cacheProduct(
    apiProduct: OpenFoodFactsProduct,
  ): Promise<FoodProduct> {
    const productData = {
      openFoodFactsId: apiProduct.code,
      name: apiProduct.product.product_name || 'Unknown Product',
      brand: apiProduct.product.brands || null,
      caloriesPer100g:
        apiProduct.product.nutriments['energy-kcal_100g'] ?? null,
      proteinPer100g: apiProduct.product.nutriments['proteins_100g'] ?? null,
      carbsPer100g: apiProduct.product.nutriments['carbohydrates_100g'] ?? null,
      fatPer100g: apiProduct.product.nutriments['fat_100g'] ?? null,
      fiberPer100g: apiProduct.product.nutriments['fiber_100g'] ?? null,
      productData: JSON.stringify(apiProduct),
      lastUpdated: new Date(),
    }

    return await prisma.foodProduct.upsert({
      where: { openFoodFactsId: apiProduct.code },
      update: productData,
      create: productData,
    })
  }

  // Calculate nutrition based on quantity and unit
  calculateNutrition(
    product: Pick<
      FoodProduct,
      | 'caloriesPer100g'
      | 'proteinPer100g'
      | 'carbsPer100g'
      | 'fatPer100g'
      | 'fiberPer100g'
    >,
    quantity: number,
    unit: string,
  ): NutritionData {
    const grams = this.convertToGrams(quantity, unit)
    const factor = grams / 100 // Convert from per 100g to actual grams

    return {
      calories: Math.round((product.caloriesPer100g || 0) * factor * 100) / 100,
      protein: Math.round((product.proteinPer100g || 0) * factor * 100) / 100,
      carbs: Math.round((product.carbsPer100g || 0) * factor * 100) / 100,
      fat: Math.round((product.fatPer100g || 0) * factor * 100) / 100,
      fiber: Math.round((product.fiberPer100g || 0) * factor * 100) / 100,
    }
  }

  private convertToGrams(quantity: number, unit: string): number {
    const unitLower = unit.toLowerCase()

    // Common conversions to grams
    const conversions: Record<string, number> = {
      g: 1,
      grams: 1,
      gram: 1,
      kg: 1000,
      kilogram: 1000,
      kilograms: 1000,
      oz: 28.35,
      ounce: 28.35,
      ounces: 28.35,
      lb: 453.59,
      pound: 453.59,
      pounds: 453.59,
      cup: 240, // Approximate for liquids
      cups: 240,
      tbsp: 15,
      tablespoon: 15,
      tablespoons: 15,
      tsp: 5,
      teaspoon: 5,
      teaspoons: 5,
      ml: 1, // Approximate for liquids
      milliliter: 1,
      milliliters: 1,
      l: 1000,
      liter: 1000,
      liters: 1000,
      piece: 100, // Default assumption
      pieces: 100,
      slice: 30, // Default assumption
      slices: 30,
    }

    const conversionFactor = conversions[unitLower] || 1
    return quantity * conversionFactor
  }

  // Get nutrition for a list of foods
  async calculateMealNutrition(
    foods: {
      openFoodFactsId?: string | null
      quantity: number
      unit: string
      caloriesPer100g?: number | null
      proteinPer100g?: number | null
      carbsPer100g?: number | null
      fatPer100g?: number | null
      fiberPer100g?: number | null
    }[],
  ): Promise<NutritionData> {
    const totalNutrition: NutritionData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    }

    for (const food of foods) {
      let nutrition: NutritionData = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }

      if (food.openFoodFactsId) {
        const product = await this.getCachedProduct(food.openFoodFactsId)
        if (product) {
          nutrition = this.calculateNutrition(product, food.quantity, food.unit)
        }
      } else if (food.caloriesPer100g !== null) {
        // Use provided nutrition data
        const grams = this.convertToGrams(food.quantity, food.unit)
        const factor = grams / 100

        nutrition = {
          calories:
            Math.round((food.caloriesPer100g || 0) * factor * 100) / 100,
          protein: Math.round((food.proteinPer100g || 0) * factor * 100) / 100,
          carbs: Math.round((food.carbsPer100g || 0) * factor * 100) / 100,
          fat: Math.round((food.fatPer100g || 0) * factor * 100) / 100,
          fiber: Math.round((food.fiberPer100g || 0) * factor * 100) / 100,
        }
      }

      totalNutrition.calories += nutrition.calories
      totalNutrition.protein += nutrition.protein
      totalNutrition.carbs += nutrition.carbs
      totalNutrition.fat += nutrition.fat
      totalNutrition.fiber += nutrition.fiber
    }

    // Round totals
    totalNutrition.calories = Math.round(totalNutrition.calories * 100) / 100
    totalNutrition.protein = Math.round(totalNutrition.protein * 100) / 100
    totalNutrition.carbs = Math.round(totalNutrition.carbs * 100) / 100
    totalNutrition.fat = Math.round(totalNutrition.fat * 100) / 100
    totalNutrition.fiber = Math.round(totalNutrition.fiber * 100) / 100

    return totalNutrition
  }

  // Utility methods
  validateBarcode(barcode: string): boolean {
    // Remove any non-digit characters
    const cleanBarcode = barcode.replace(/\D/g, '')

    // Check if it's a valid length (8, 12, 13, or 14 digits)
    const validLengths = [8, 12, 13, 14]
    if (!validLengths.includes(cleanBarcode.length)) {
      return false
    }

    // Basic checksum validation for EAN-13
    if (cleanBarcode.length === 13) {
      return this.validateEAN13(cleanBarcode)
    }

    return cleanBarcode.length >= 8
  }

  private validateEAN13(barcode: string): boolean {
    if (barcode.length !== 13) return false

    const digits = barcode.split('').map(Number)
    const checkDigit = digits.pop()!

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }

    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  formatBarcode(barcode: string): string {
    return barcode.replace(/\D/g, '')
  }

  hasNutritionData(
    product: Pick<
      FoodProduct,
      'caloriesPer100g' | 'proteinPer100g' | 'carbsPer100g' | 'fatPer100g'
    >,
  ): boolean {
    return !!(
      product.caloriesPer100g ||
      product.proteinPer100g ||
      product.carbsPer100g ||
      product.fatPer100g
    )
  }

  extractNutritionFromOpenFoodFacts(product: OpenFoodFactsProduct): {
    name: string
    brand?: string
    caloriesPer100g?: number
    proteinPer100g?: number
    carbsPer100g?: number
    fatPer100g?: number
    fiberPer100g?: number
    sugarPer100g?: number
    sodiumPer100g?: number
    imageUrl?: string
    ingredients?: string
    allergens?: string
  } {
    const nutriments = product.product.nutriments || {}

    return {
      name: product.product.product_name || 'Unknown Product',
      brand: product.product.brands || undefined,
      caloriesPer100g: nutriments['energy-kcal_100g'] || undefined,
      proteinPer100g: nutriments['proteins_100g'] || undefined,
      carbsPer100g: nutriments['carbohydrates_100g'] || undefined,
      fatPer100g: nutriments['fat_100g'] || undefined,
      fiberPer100g: nutriments['fiber_100g'] || undefined,
      sugarPer100g: nutriments['sugars_100g'] || undefined,
      sodiumPer100g: nutriments['salt_100g']
        ? nutriments['salt_100g'] * 400
        : undefined, // Convert salt to sodium
      imageUrl:
        product.product.image_front_url ||
        product.product.image_url ||
        undefined,
      ingredients: product.product.ingredients_text || undefined,
      allergens: product.product.allergens || undefined,
    }
  }

  // Quick nutrition calculation without full object
  quickNutritionCalc(
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    quantity: number,
    unit: string,
  ): NutritionData {
    const grams = this.convertToGrams(quantity, unit)
    const factor = grams / 100

    return {
      calories: Math.round(calories * factor * 100) / 100,
      protein: Math.round(protein * factor * 100) / 100,
      carbs: Math.round(carbs * factor * 100) / 100,
      fat: Math.round(fat * factor * 100) / 100,
      fiber: 0, // Not provided in quick calc
    }
  }

  // Get common serving sizes for reference
  getCommonServingSizes(
    productType?: string,
  ): { unit: string; grams: number }[] {
    const common = [
      { unit: 'serving', grams: 100 },
      { unit: 'cup', grams: 240 },
      { unit: 'tablespoon', grams: 15 },
      { unit: 'teaspoon', grams: 5 },
      { unit: 'slice', grams: 30 },
      { unit: 'piece', grams: 100 },
    ]

    if (productType?.toLowerCase().includes('liquid')) {
      return [
        { unit: 'ml', grams: 1 },
        { unit: 'cup', grams: 240 },
        { unit: 'tablespoon', grams: 15 },
        { unit: 'teaspoon', grams: 5 },
        ...common,
      ]
    }

    return common
  }

  // Check if nutrition data is reasonable (basic validation)
  validateNutritionData(nutrition: {
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fat?: number | null
  }): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = []
    let isValid = true

    // Check if all values are null/undefined
    if (
      !nutrition.calories &&
      !nutrition.protein &&
      !nutrition.carbs &&
      !nutrition.fat
    ) {
      warnings.push('No nutrition data provided')
      isValid = false
    }

    // Check for unrealistic values
    if (
      nutrition.calories &&
      (nutrition.calories < 0 || nutrition.calories > 9000)
    ) {
      warnings.push('Unrealistic calorie value')
      isValid = false
    }

    if (
      nutrition.protein &&
      (nutrition.protein < 0 || nutrition.protein > 100)
    ) {
      warnings.push('Unrealistic protein value')
    }

    if (nutrition.carbs && (nutrition.carbs < 0 || nutrition.carbs > 100)) {
      warnings.push('Unrealistic carbs value')
    }

    if (nutrition.fat && (nutrition.fat < 0 || nutrition.fat > 100)) {
      warnings.push('Unrealistic fat value')
    }

    return { isValid, warnings }
  }

  // Check API health
  async checkApiHealth(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/product/737628064502`, {
        headers: { 'User-Agent': this.userAgent },
      })

      if (response.ok) {
        return { status: 'ok', message: 'API is responding' }
      } else {
        throw new OpenFoodFactsError('API health check failed', response.status)
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Export both the class and a singleton instance
export { OpenFoodFactsError }
export const openFoodFactsClient = new OpenFoodFactsClient()
