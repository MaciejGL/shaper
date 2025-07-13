import { NextResponse } from 'next/server'

import { openFoodFactsClient } from '@/lib/open-food-facts/client'
import {
  FoodSearchCacheKeys,
  FoodSearchCacheTTL,
  getFromCache,
  setInCache,
} from '@/lib/redis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const barcode = searchParams.get('barcode')

  try {
    if (barcode) {
      // Handle barcode search with caching
      const cacheKey = FoodSearchCacheKeys.productDetails(barcode)

      // Try to get from cache first
      const cachedProduct = await getFromCache(cacheKey)
      if (cachedProduct) {
        return NextResponse.json({ product: cachedProduct })
      }

      // Cache miss - fetch from API
      const product = await openFoodFactsClient.getProduct(barcode)

      if (product) {
        // Cache the result for future requests
        await setInCache(cacheKey, product, FoodSearchCacheTTL.productDetails)
      }

      return NextResponse.json({ product })
    }

    if (query) {
      // Handle text search with caching
      const normalizedQuery = query.trim().toLowerCase()
      const cacheKey = FoodSearchCacheKeys.searchResults(normalizedQuery)

      // Try to get from cache first
      const cachedProducts = await getFromCache(cacheKey)
      if (cachedProducts) {
        return NextResponse.json({ products: cachedProducts })
      }

      // Cache miss - fetch from API
      const products = await openFoodFactsClient.searchProducts(query)

      if (products && products.length > 0) {
        // Cache the results for future requests
        await setInCache(cacheKey, products, FoodSearchCacheTTL.searchResults)
      }

      return NextResponse.json({ products })
    }

    return NextResponse.json(
      { error: 'Missing query or barcode' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Food search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
