import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/getUser'
import {
  buildTrainerOfferWhereClause,
  fetchOfferPricingData,
  fetchTrainerOffers,
  transformTrainerOffers,
  validateTrainerOfferParams,
} from '@/lib/trainer-offers-utils'

export async function GET(req: NextRequest) {
  try {
    // Check user authentication
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate query parameters and authorization
    const params = validateTrainerOfferParams(req, currentUser.user.id)

    // Build database query filters
    const whereClause = buildTrainerOfferWhereClause(params)

    // Fetch offers from database
    const offers = await fetchTrainerOffers(whereClause)

    // Get pricing data from Stripe
    const pricingData = await fetchOfferPricingData(offers)

    // Transform data for frontend
    const transformedOffers = transformTrainerOffers(offers, pricingData)

    return NextResponse.json({
      offers: transformedOffers,
      total: transformedOffers.length,
    })
  } catch (error) {
    console.error('Error fetching trainer offers:', error)

    // Handle specific validation errors with appropriate status codes
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'

    if (errorMessage.includes('Missing clientEmail or trainerId')) {
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    if (errorMessage.includes('Forbidden')) {
      return NextResponse.json({ error: errorMessage }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
