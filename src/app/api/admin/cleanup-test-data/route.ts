import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

interface CleanupRequest {
  userId?: string
  clientEmail?: string
  dryRun?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    await requireAdminUser()

    // Parse request body
    const body: CleanupRequest = await request.json().catch(() => ({}))
    const {
      userId = 'cma8vis7c0004uh392ewu2vnb',
      clientEmail = 'm.glowacki01@gmail.com',
      dryRun = false,
    } = body

    if (dryRun) {
      // Dry run - just count what would be deleted
      const [serviceDeliveries, trainerOffers, userSubscriptions, user] =
        await Promise.all([
          prisma.serviceDelivery.findMany({
            where: { clientId: userId },
            include: { tasks: true },
          }),
          prisma.trainerOffer.count({
            where: { clientEmail: clientEmail },
          }),
          prisma.userSubscription.count({
            where: { userId: userId },
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, stripeCustomerId: true },
          }),
        ])

      const totalTasks = serviceDeliveries.reduce(
        (acc, sd) => acc + sd.tasks.length,
        0,
      )

      return NextResponse.json({
        success: true,
        dryRun: true,
        stats: {
          userId,
          clientEmail,
          userEmail: user?.email || 'Not found',
          currentStripeCustomerId: user?.stripeCustomerId || null,
          serviceTasks: totalTasks,
          serviceDeliveries: serviceDeliveries.length,
          trainerOffers: trainerOffers,
          userSubscriptions: userSubscriptions,
        },
        message: `Would clean up test data for user ${userId} (${user?.email || 'Not found'})`,
      })
    }

    // Actual cleanup
    console.info('🧹 Starting test data cleanup via admin API...')

    // Step 1: Find ServiceDelivery records for the clientId
    const serviceDeliveries = await prisma.serviceDelivery.findMany({
      where: { clientId: userId },
      include: { tasks: true },
    })

    const serviceDeliveryIds = serviceDeliveries.map((sd) => sd.id)

    // Step 2: Delete ServiceTask records (must be deleted first due to foreign key)
    let deletedTasksCount = 0
    if (serviceDeliveryIds.length > 0) {
      const deletedTasks = await prisma.serviceTask.deleteMany({
        where: {
          serviceDeliveryId: {
            in: serviceDeliveryIds,
          },
        },
      })
      deletedTasksCount = deletedTasks.count
    }

    // Step 3: Delete ServiceDelivery records
    const deletedDeliveries = await prisma.serviceDelivery.deleteMany({
      where: { clientId: userId },
    })

    // Step 4: Delete TrainerOffer records by clientEmail
    const deletedOffers = await prisma.trainerOffer.deleteMany({
      where: { clientEmail: clientEmail },
    })

    // Step 5: Delete UserSubscription records
    const deletedSubscriptions = await prisma.userSubscription.deleteMany({
      where: { userId: userId },
    })

    // Step 6: Update User record to set stripeCustomerId to null
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: null },
    })

    const stats = {
      userId,
      clientEmail,
      userEmail: updatedUser.email,
      serviceTasks: deletedTasksCount,
      serviceDeliveries: deletedDeliveries.count,
      trainerOffers: deletedOffers.count,
      userSubscriptions: deletedSubscriptions.count,
      stripeCustomerIdCleared: true,
    }

    console.info('🎉 Test data cleanup completed via admin API', stats)

    return NextResponse.json({
      success: true,
      dryRun: false,
      stats,
      message: `Successfully cleaned up test data for user ${updatedUser.email}`,
    })
  } catch (error) {
    console.error('Error cleaning up test data:', error)

    // Handle admin auth errors
    if (
      error instanceof Error &&
      error.message.includes('Admin access required')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Failed to cleanup test data' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
