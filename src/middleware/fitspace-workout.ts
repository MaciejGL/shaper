import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export async function fitspaceWorkoutMiddleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token || !token.sub) {
    // If no user, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Get user ID from token
    const userId = token.sub

    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Query active training plans directly
    const activePlans = await prisma.trainingPlan.findMany({
      where: {
        assignedToId: userId,
        active: true,
      },
      select: {
        id: true,
        assignedToId: true,
        createdById: true,
      },
    })

    const quickWorkoutId = activePlans.find(
      (plan) => plan.assignedToId === userId && plan.createdById === userId,
    )
    const trainingFromTrainer = activePlans.find(
      (plan) => plan.assignedToId === userId && plan.createdById !== userId,
    )

    if (trainingFromTrainer) {
      return NextResponse.redirect(
        new URL(`/fitspace/workout/${trainingFromTrainer.id}`, request.url),
      )
    } else if (quickWorkoutId) {
      return NextResponse.redirect(
        new URL(`/fitspace/workout/${quickWorkoutId.id}`, request.url),
      )
    } else {
      return NextResponse.redirect(new URL('/fitspace/my-plans', request.url))
    }
  } catch (error) {
    console.error('Middleware workout redirect error:', error)
    // Fallback to my-plans on error
    return NextResponse.redirect(new URL('/fitspace/my-plans', request.url))
  }
}
