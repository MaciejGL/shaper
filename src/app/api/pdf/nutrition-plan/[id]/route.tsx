import { renderToBuffer } from '@react-pdf/renderer'
import { NextRequest, NextResponse } from 'next/server'

import { NutritionPlanPDF } from '@/app/(protected)/fitspace/nutrition/components/pdf/nutrition-plan-pdf'
// import { GQLUserRole } from '@/generated/graphql-server'
// import { getCurrentUser } from '@/lib/getUser'
// Import to ensure fonts are registered
import '@/lib/pdf/pdf-generator'
import { getNutritionPlanById } from '@/server/models/nutrition-plan/factory'

import { transformPrismaToNutritionPlanPDFData } from './transform'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // const user = await getCurrentUser()
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 },
    //   )
    // }

    const nutritionPlan = await getNutritionPlanById(id)

    // Access control: trainers can see their own plans, clients can see shared plans
    // if (user.user.role === GQLUserRole.Trainer) {
    //   if (nutritionPlan.trainerId !== user.user.id) {
    //     return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    //   }
    // } else if (user.user.role === GQLUserRole.Client) {
    //   if (
    //     nutritionPlan.clientId !== user.user.id ||
    //     !nutritionPlan.isSharedWithClient
    //   ) {
    //     return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    //   }
    // } else {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    // }

    const pdfData = transformPrismaToNutritionPlanPDFData(nutritionPlan)

    const pdfBuffer = await renderToBuffer(
      <NutritionPlanPDF nutritionPlan={pdfData} />,
    )

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfBytes = new Uint8Array(pdfBuffer)

    const filename = `Nutrition Plan - ${nutritionPlan.name}.pdf`
      .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)

    if (
      error instanceof Error &&
      error.message === 'Nutrition plan not found'
    ) {
      return NextResponse.json(
        { error: 'Nutrition plan not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    )
  }
}
