import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser()

    const { id } = await params
    const body = await request.json()

    // Only allow updating isPublic, premium, and heroImageUrl fields
    const updateData: {
      isPublic?: boolean
      premium?: boolean
      heroImageUrl?: string
    } = {}

    if (typeof body.isPublic === 'boolean') {
      updateData.isPublic = body.isPublic
    }

    if (typeof body.premium === 'boolean') {
      updateData.premium = body.premium
    }

    if (typeof body.heroImageUrl === 'string') {
      updateData.heroImageUrl = body.heroImageUrl
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      )
    }

    const updatedPlan = await prisma.trainingPlan.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        isPublic: true,
        premium: true,
        updatedAt: true,
      },
    })

    // Revalidate explore page to show updated hero images
    revalidatePath('/fitspace/explore')

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    })
  } catch (error) {
    console.error('Error updating training plan:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update training plan',
      },
      { status: 500 },
    )
  }
}
