import { NextResponse } from 'next/server'

import { openFoodFactsClient } from '@/lib/open-food-facts/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { foods } = body

    if (!foods || !Array.isArray(foods)) {
      return NextResponse.json({ error: 'Invalid foods data' }, { status: 400 })
    }

    // Calculate nutrition for the meal
    const nutrition = await openFoodFactsClient.calculateMealNutrition(foods)

    return NextResponse.json({ nutrition })
  } catch (error) {
    console.error('Nutrition calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// For single food item nutrition calculation
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barcode = searchParams.get('barcode')
  const quantity = searchParams.get('quantity')
  const unit = searchParams.get('unit')

  try {
    if (!barcode || !quantity || !unit) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: barcode, quantity, unit',
        },
        { status: 400 },
      )
    }

    // Get product from API (will use cache if available)
    const product = await openFoodFactsClient.getProduct(barcode)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate nutrition based on quantity
    const nutrition = openFoodFactsClient.calculateNutrition(
      {
        caloriesPer100g: product.product.nutriments['energy-kcal_100g'] ?? null,
        proteinPer100g: product.product.nutriments['proteins_100g'] ?? null,
        carbsPer100g: product.product.nutriments['carbohydrates_100g'] ?? null,
        fatPer100g: product.product.nutriments['fat_100g'] ?? null,
        fiberPer100g: product.product.nutriments['fiber_100g'] ?? null,
      },
      parseFloat(quantity),
      unit,
    )

    return NextResponse.json({ nutrition, product })
  } catch (error) {
    console.error('Single food nutrition error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
