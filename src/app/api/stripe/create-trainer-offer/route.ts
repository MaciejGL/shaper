import { NextRequest, NextResponse } from 'next/server'

import {
  createPackageSummary,
  createTrainerOffer,
  fetchOfferData,
  formatCreateOfferResponse,
  generateOfferUrl,
  sendOfferNotifications,
  validateCreateOfferInput,
  validatePackages,
} from '@/lib/create-trainer-offer-utils'
import { getCurrentUser } from '@/lib/getUser'

// Trainer creates bundle offer with multiple packages and sends web checkout link to client
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate and parse request input
    const input = await validateCreateOfferInput(request)

    // Verify the trainerId matches the authenticated user
    if (input.trainerId !== currentUser.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot create offers for another trainer' },
        { status: 403 },
      )
    }

    // Validate package constraints
    validatePackages(input.packages)

    // Fetch trainer and package template data
    const { trainer, packageTemplates } = await fetchOfferData(input)

    // Create enriched package summary
    const packageSummary = createPackageSummary(
      input.packages,
      packageTemplates,
    )

    // Create trainer offer in database
    const offer = await createTrainerOffer(input, packageSummary)

    // Generate offer URL for client
    const offerUrl = generateOfferUrl(offer.token)

    // Send notifications (email, in-app, push)
    await sendOfferNotifications({
      input,
      offer,
      offerUrl,
      trainer,
      packageSummary,
    })

    // Format and return success response
    const response = formatCreateOfferResponse(
      offer,
      offerUrl,
      trainer,
      packageSummary,
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating trainer offer:', error)

    // Handle specific validation errors with appropriate status codes
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create package offer'

    if (
      errorMessage.includes('required') ||
      errorMessage.includes('packageId') ||
      errorMessage.includes('quantity') ||
      errorMessage.includes('Quantity must be')
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    if (
      errorMessage.includes('not found') ||
      errorMessage.includes('not configured for payments')
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to create package offer' },
      { status: 500 },
    )
  }
}
