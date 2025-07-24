import { NextResponse } from 'next/server'

import type { SearchResult } from '@/lib/food-search'
import { getCurrentUser } from '@/lib/getUser'
import {
  type OpenFoodFactsSearchResult,
  openFoodFactsSearchService,
} from '@/lib/openfoodfacts-search'
import {
  FoodSearchCacheKeys,
  FoodSearchCacheTTL,
  getFromCache,
  setInCache,
} from '@/lib/redis'
import { type USDASearchResult, usdaSearchService } from '@/lib/usda-search'

// ============================================================================
// CONVERSION UTILITIES (Server-side)
// ============================================================================

/**
 * Convert USDA search result to SearchResult format
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
 * Convert local OpenFoodFacts search result to SearchResult format
 */
function convertOpenFoodFactsToSearchResult(
  product: OpenFoodFactsSearchResult,
): SearchResult {
  return {
    name: product.name,
    source: 'openfoodfacts',
    openFoodFactsId: product.code,
    brands: product.brands,
    caloriesPer100g: product.caloriesPer100g || 0,
    proteinPer100g: product.proteinPer100g || 0,
    carbsPer100g: product.carbsPer100g || 0,
    fatPer100g: product.fatPer100g || 0,
    fiberPer100g: product.fiberPer100g || 0,
    servingQuantity: product.servingQuantity,
    servingSize: product.servingSize,
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * Food search API endpoint
 *
 * Query Parameters:
 * - q: Search query (required for text search)
 * - barcode: Product barcode (for barcode lookup)
 * - country: Country preference for results (default: 'Norway')
 *
 * Examples:
 * - /api/food/search?q=porridge
 * - /api/food/search?q=chicken&country=Sweden
 * - /api/food/search?barcode=1234567890
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const barcode = searchParams.get('barcode')
  const country = searchParams.get('country') || 'Norway' // Default to Norway

  const totalStart = Date.now()

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    if (barcode) {
      // Handle barcode search with caching
      const cacheKey = FoodSearchCacheKeys.productDetails(barcode)

      // Try to get from cache first
      const cachedProduct = await getFromCache(cacheKey)
      if (cachedProduct) {
        return NextResponse.json({ product: cachedProduct })
      }

      // Cache miss - search local database
      const product = await openFoodFactsSearchService.getProductByCode(barcode)

      if (product) {
        // Cache the result for future requests
        await setInCache(cacheKey, product, FoodSearchCacheTTL.productDetails)
      }

      return NextResponse.json({ product })
    }

    if (query) {
      // Handle hybrid text search (USDA + OpenFoodFacts) with caching
      const cacheKey = FoodSearchCacheKeys.searchResults(query)

      // Try to get from cache first
      const cachedResults = await getFromCache(cacheKey)
      if (cachedResults) {
        return NextResponse.json(cachedResults)
      }

      // Cache miss - perform SMART TIERED search for better performance
      const results: SearchResult[] = []

      // Phase 1: Quick USDA search (most reliable nutrition data)
      // This is typically faster and has more complete nutrition info
      const usdaResults = await usdaSearchService.searchFoods(query, 12)
      if (usdaResults.length > 0) {
        const convertedUSDA = usdaResults.map(convertUSDAToSearchResult)
        results.push(...convertedUSDA)
      }

      // Phase 2: Only search OpenFoodFacts if we need more results
      // This saves ~200-500ms when USDA has sufficient results
      if (results.length < 8) {
        const remainingSlots = 20 - results.length

        const offStart = Date.now()

        try {
          const offResults = await openFoodFactsSearchService.searchProducts(
            query,
            remainingSlots,
            country,
          )

          if (offResults.length > 0) {
            const convertedOFF = offResults.map(
              convertOpenFoodFactsToSearchResult,
            )
            results.push(...convertedOFF)
          }
        } catch (error) {
          const offTime = Date.now() - offStart
          console.error(
            `❌ OpenFoodFacts search failed after ${offTime}ms:`,
            error,
          )
          // Continue with USDA results only - graceful degradation
        }
      }

      const finalResults = results.slice(0, 20)

      // Cache the results with longer TTL for better hit rates
      if (finalResults.length > 0) {
        await setInCache(
          cacheKey,
          finalResults,
          FoodSearchCacheTTL.searchResults,
        )
      }

      return NextResponse.json(finalResults)
    }

    return NextResponse.json(
      { error: 'Missing query or barcode' },
      { status: 400 },
    )
  } catch (error) {
    const totalTime = Date.now() - totalStart
    console.error(`❌ API Food search error after ${totalTime}ms:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
