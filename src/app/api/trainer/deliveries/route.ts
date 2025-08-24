import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const trainerId = searchParams.get('trainerId')
    const status = searchParams.get('status') // 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    const clientId = searchParams.get('clientId') // Optional filter by client

    if (!trainerId) {
      return NextResponse.json({ error: 'Missing trainerId' }, { status: 400 })
    }

    // Verify the trainer is accessing their own deliveries
    if (currentUser.user.id !== trainerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build where clause
    const whereClause: any = {
      trainerId: trainerId,
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    // Get service deliveries with client and package info
    const deliveries = await prisma.serviceDelivery.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then IN_PROGRESS, then COMPLETED
        { createdAt: 'desc' },
      ],
    })

    // Format the response
    const formattedDeliveries = deliveries.map((delivery) => ({
      id: delivery.id,
      serviceType: delivery.serviceType,
      packageName: delivery.packageName,
      quantity: delivery.quantity,
      status: delivery.status,
      deliveredAt: delivery.deliveredAt?.toISOString() || null,
      deliveryNotes: delivery.deliveryNotes,
      stripePaymentIntentId: delivery.stripePaymentIntentId,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
      client: {
        id: delivery.client.id,
        name: delivery.client.name,
        email: delivery.client.email,
        displayName:
          delivery.client.profile?.firstName &&
          delivery.client.profile?.lastName
            ? `${delivery.client.profile.firstName} ${delivery.client.profile.lastName}`
            : delivery.client.name || delivery.client.email,
      },
      metadata: delivery.metadata,
    }))

    // Group by status for summary
    const summary = {
      pending: formattedDeliveries.filter((d) => d.status === 'PENDING').length,
      inProgress: formattedDeliveries.filter((d) => d.status === 'IN_PROGRESS')
        .length,
      completed: formattedDeliveries.filter((d) => d.status === 'COMPLETED')
        .length,
      total: formattedDeliveries.length,
    }

    return NextResponse.json({
      deliveries: formattedDeliveries,
      summary,
    })
  } catch (error) {
    console.error('Error fetching service deliveries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
