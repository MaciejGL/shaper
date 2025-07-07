import { NextResponse } from 'next/server'

import { openFoodFactsClient } from '@/lib/open-food-facts/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const barcode = searchParams.get('barcode')

  try {
    if (barcode) {
      // Search by barcode
      const product = await openFoodFactsClient.getProduct(barcode)
      return NextResponse.json({ product })
    }

    if (query) {
      // Search by name
      const products = await openFoodFactsClient.searchProducts(query)
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
