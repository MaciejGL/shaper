import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, deliveryNotes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing delivery ID' },
        { status: 400 },
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 },
      )
    }

    // Get current delivery to verify ownership
    const delivery = await prisma.serviceDelivery.findUnique({
      where: { id },
      select: {
        id: true,
        trainerId: true,
        status: true,
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Service delivery not found' },
        { status: 404 },
      )
    }

    // Verify the trainer owns this delivery
    if (delivery.trainerId !== currentUser.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: Prisma.ServiceDeliveryUpdateInput = {}

    if (status) {
      updateData.status = status

      // Set deliveredAt when marked as completed
      if (status === 'COMPLETED' && delivery.status !== 'COMPLETED') {
        updateData.deliveredAt = new Date()
      }

      // Clear deliveredAt if moving back from completed
      if (status !== 'COMPLETED' && delivery.status === 'COMPLETED') {
        updateData.deliveredAt = null
      }
    }

    if (deliveryNotes !== undefined) {
      updateData.deliveryNotes = deliveryNotes
    }

    // Update the delivery
    const updatedDelivery = await prisma.serviceDelivery.update({
      where: { id },
      data: updateData,
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
    })

    // Format the response
    const formattedDelivery = {
      id: updatedDelivery.id,
      serviceType: updatedDelivery.serviceType,
      packageName: updatedDelivery.packageName,
      quantity: updatedDelivery.quantity,
      status: updatedDelivery.status,
      deliveredAt: updatedDelivery.deliveredAt?.toISOString() || null,
      deliveryNotes: updatedDelivery.deliveryNotes,
      stripePaymentIntentId: updatedDelivery.stripePaymentIntentId,
      createdAt: updatedDelivery.createdAt.toISOString(),
      updatedAt: updatedDelivery.updatedAt.toISOString(),
      client: {
        id: updatedDelivery.client.id,
        name: updatedDelivery.client.name,
        email: updatedDelivery.client.email,
        displayName:
          updatedDelivery.client.profile?.firstName &&
          updatedDelivery.client.profile?.lastName
            ? `${updatedDelivery.client.profile.firstName} ${updatedDelivery.client.profile.lastName}`
            : updatedDelivery.client.name || updatedDelivery.client.email,
      },
      metadata: updatedDelivery.metadata,
    }

    return NextResponse.json({
      delivery: formattedDelivery,
    })
  } catch (error) {
    console.error('Error updating service delivery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Missing delivery ID' },
        { status: 400 },
      )
    }

    // Get delivery with client info
    const delivery = await prisma.serviceDelivery.findUnique({
      where: { id },
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
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Service delivery not found' },
        { status: 404 },
      )
    }

    // Verify the trainer owns this delivery
    if (delivery.trainerId !== currentUser.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Format the response
    const formattedDelivery = {
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
    }

    return NextResponse.json({
      delivery: formattedDelivery,
    })
  } catch (error) {
    console.error('Error fetching service delivery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
