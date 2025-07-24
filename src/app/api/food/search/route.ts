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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const barcode = searchParams.get('barcode')

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

      // Cache miss - perform hybrid search
      const [usdaResults, openFoodFactsResults] = await Promise.allSettled([
        // Search USDA database (local)
        usdaSearchService.searchFoods(query, 10),
        // Search OpenFoodFacts database (local) with country preference
        openFoodFactsSearchService.searchProducts(query, 10, 'Norway'),
      ])

      // Convert and combine results with USDA prioritized
      const results: SearchResult[] = []

      // Add USDA results first (highest priority - complete nutrition data)
      if (usdaResults.status === 'fulfilled' && usdaResults.value.length > 0) {
        const convertedUSDA = usdaResults.value.map(convertUSDAToSearchResult)
        results.push(...convertedUSDA)
      }

      // Add OpenFoodFacts results (brand products, international foods)
      if (
        openFoodFactsResults.status === 'fulfilled' &&
        openFoodFactsResults.value &&
        openFoodFactsResults.value.length > 0
      ) {
        const convertedOFF = openFoodFactsResults.value.map(
          convertOpenFoodFactsToSearchResult,
        )
        results.push(...convertedOFF)
      }

      const finalResults = results.slice(0, 20) // Limit to 20 results

      // Cache the converted results for future requests
      if (finalResults.length > 0) {
        await setInCache(
          cacheKey,
          finalResults,
          FoodSearchCacheTTL.searchResults,
        )
      }

      // Return SearchResult[] directly (no more conversion needed frontend)
      return NextResponse.json(finalResults)
    }

    return NextResponse.json(
      { error: 'Missing query or barcode' },
      { status: 400 },
    )
  } catch (error) {
    console.error('❌ API Food search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
